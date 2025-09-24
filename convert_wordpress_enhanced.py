#!/usr/bin/env python3

import xml.etree.ElementTree as ET
import re
import html
import json
from pathlib import Path
import os

def unserialize_php(data):
    """Simple PHP unserialization for basic array structures"""
    if not data:
        return []
    
    # Handle simple PHP array format like: a:1:{i:0;s:3:"152";}
    # This is a very basic parser for the specific format we're seeing
    try:
        if data.startswith('a:'):
            # Extract the array contents
            match = re.search(r'a:\d+:\{(.+)\}', data)
            if match:
                content = match.group(1)
                # Extract string values
                string_matches = re.findall(r's:\d+:"([^"]+)"', content)
                return string_matches
        return [data]  # Return as single item if not array
    except:
        return []

def extract_relationships_and_images(item, namespaces):
    """Extract relationship data and images from a WordPress item"""
    
    # Extract postmeta for relationships
    postmetas = item.findall('wp:postmeta', namespaces)
    relationships = {}
    
    for meta in postmetas:
        key_elem = meta.find('wp:meta_key', namespaces)
        value_elem = meta.find('wp:meta_value', namespaces)
        
        if key_elem is not None and value_elem is not None:
            key = key_elem.text
            value = value_elem.text or ""
            
            # Route-to-Area relationships
            if key == 'parent':
                relationships['parentArea'] = value
            
            # Trip plan destinations
            elif key == 'destinations':
                destinations = unserialize_php(value)
                relationships['destinations'] = destinations
            
            # Featured images
            elif key == '_thumbnail_id':
                relationships['featuredImageId'] = value
    
    # Extract content and process images/betacreator
    content_elem = item.find('content:encoded', namespaces)
    if content_elem is not None and content_elem.text:
        content = content_elem.text
        
        # Extract images
        images = re.findall(r'<img[^>]*src="([^"]*)"[^>]*>', content)
        
        # Extract and convert betacreator blocks
        content = convert_betacreator_blocks(content)
        
        # Convert other HTML to markdown while preserving images
        content = html_to_markdown_with_images(content)
        
        return content, images, relationships
    
    return "", [], relationships

def convert_betacreator_blocks(content):
    """Convert WordPress betacreator blocks to custom TinaCMS markdown components"""
    
    # Find betacreator blocks with more comprehensive regex
    def replace_betacreator(match):
        full_div = match.group(0)
        print(f"Found betacreator block: {full_div[:200]}...")
        
        # Extract data-topo attribute
        data_topo_match = re.search(r'data-topo="([^"]*)"', full_div)
        if not data_topo_match:
            print("No data-topo found")
            return full_div  # Return original if no data-topo
            
        data_topo = data_topo_match.group(1)
        print(f"Found data-topo: {data_topo[:100]}...")
        
        # Extract the original image src (beta-img-original)
        img_src = None
        img_match = re.search(r'<img[^>]*class="[^"]*beta-img-original[^"]*"[^>]*src="([^"]*)"[^>]*>', full_div)
        if img_match:
            img_src = img_match.group(1)
        else:
            # Fallback to any img tag that's not the topo overlay
            img_match = re.search(r'<img[^>]*src="((?!data:image)[^"]*)"[^>]*>', full_div)
            if img_match:
                img_src = img_match.group(1)
            else:
                img_src = "route-topo-placeholder.jpg"
        
        print(f"Using original image src: {img_src}")
        
        # Extract the overlay image (beta-img-topo with base64 data)
        overlay_src = None
        overlay_match = re.search(r'<img[^>]*class="[^"]*beta-img-topo[^"]*"[^>]*src="(data:image/[^"]*)"[^>]*>', full_div)
        if overlay_match:
            overlay_src = overlay_match.group(1)
            print(f"Found overlay image: {overlay_src[:50]}...")
        else:
            print("No overlay image found")
        
        try:
            # Unescape HTML entities in the JSON data
            unescaped_data = html.unescape(data_topo)
            
            # Create custom TinaCMS component with both images
            if overlay_src:
                result = f'''
<RouteOverlay 
  imageSrc="{img_src}" 
  topoData="{html.escape(unescaped_data)}"
  topoOverlaySrc="{overlay_src}"
/>
'''
            else:
                result = f'''
<RouteOverlay 
  imageSrc="{img_src}" 
  topoData="{html.escape(unescaped_data)}"
/>
'''
            return result.strip()
            
        except Exception as e:
            print(f"Error processing betacreator block: {e}")
            # Fallback to just showing the image
            return f'![Route topo]({img_src})'
    
    # Replace betacreator blocks - updated regex to be more flexible
    patterns = [
        r'<!-- wp:andrewleader/betacreator -->.*?<!-- /wp:andrewleader/betacreator -->',
        r'<div[^>]*class="[^"]*betacreator[^"]*"[^>]*>.*?</div>',
        r'<div[^>]*class="[^"]*wp-block-andrewleader-betacreator[^"]*"[^>]*>.*?</div>'
    ]
    
    for pattern in patterns:
        content = re.sub(pattern, replace_betacreator, content, flags=re.DOTALL)
    
    return content

def html_to_markdown_with_images(content):
    """Convert HTML to Markdown while preserving image URLs and custom components"""
    if not content:
        return ""
    
    # First, protect custom components (RouteOverlay, etc.) by temporarily replacing them
    custom_components = {}
    component_counter = 0
    
    # Find and store all RouteOverlay components
    def protect_component(match):
        nonlocal component_counter
        placeholder = f"CUSTOM_COMPONENT_PLACEHOLDER_{component_counter}"
        custom_components[placeholder] = match.group(0)
        component_counter += 1
        return placeholder
    
    content = re.sub(r'<RouteOverlay[^>]*/>(?:\s*</RouteOverlay>)?', protect_component, content, flags=re.DOTALL)
    
    # Convert common HTML elements to Markdown
    content = re.sub(r'<h1[^>]*>(.*?)</h1>', r'# \1', content, flags=re.DOTALL)
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', content, flags=re.DOTALL)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', content, flags=re.DOTALL)
    content = re.sub(r'<h4[^>]*>(.*?)</h4>', r'#### \1', content, flags=re.DOTALL)
    
    # Convert links
    content = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', content, flags=re.DOTALL)
    
    # Convert single WordPress images with captions (handle before galleries)
    def convert_single_image(match):
        figure_content = match.group(0)
        
        # Extract image src
        img_match = re.search(r'<img[^>]*src="([^"]*)"[^>]*', figure_content)
        if not img_match:
            return figure_content  # Return original if no image found
        
        src = img_match.group(1)
        
        # Extract caption text
        caption_match = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', figure_content, flags=re.DOTALL)
        if caption_match:
            caption = re.sub(r'<[^>]+>', '', caption_match.group(1)).strip()
            return f'![{caption}]({src})\n\n'
        else:
            return f'![]({src})\n\n'
    
    # Handle single WordPress image blocks (wp-block-image) - do this before galleries
    content = re.sub(r'<figure[^>]*class="[^"]*wp-block-image[^"]*"[^>]*>.*?</figure>', convert_single_image, content, flags=re.DOTALL)
    
    # Convert WordPress galleries (handle after single images)
    def convert_gallery(match):
        gallery_content = match.group(0)
        
        # Find all gallery items with images and captions
        gallery_items = []
        
        # First find all img tags with src - handle both self-closing and regular
        img_pattern = r'<img[^>]*src="([^"]*)"[^>]*(?:/>|>)'
        images = re.findall(img_pattern, gallery_content)
        
        # Then find all captions
        caption_pattern = r'<figcaption[^>]*class="[^"]*blocks-gallery-item__caption[^"]*"[^>]*>(.*?)</figcaption>'
        captions = re.findall(caption_pattern, gallery_content, flags=re.DOTALL)
        
        # Match images with captions (assuming they're in order)
        for i, src in enumerate(images):
            if i < len(captions):
                caption = re.sub(r'<[^>]+>', '', captions[i]).strip()
                gallery_items.append(f'![{caption}]({src})')
            else:
                gallery_items.append(f'![]({src})')
        
        # Return images without bullet points, separated by line breaks
        return '\n'.join(gallery_items) + '\n\n'
    
    # Handle WordPress gallery blocks - match to </ul></figure> to avoid nested figure tag issues
    content = re.sub(r'<figure[^>]*class="[^"]*wp-block-gallery[^"]*"[^>]*>.*?</ul></figure>', convert_gallery, content, flags=re.DOTALL)
    
    # Convert images (preserve Azure blob URLs)
    content = re.sub(r'<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*/?>', r'![\2](\1)', content)
    content = re.sub(r'<img[^>]*src="([^"]*)"[^>]*/?>', r'![](\1)', content)
    
    # Convert paragraphs
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', content, flags=re.DOTALL)
    
    # Convert lists
    content = re.sub(r'<ul[^>]*>(.*?)</ul>', lambda m: convert_ul(m.group(1)), content, flags=re.DOTALL)
    content = re.sub(r'<ol[^>]*>(.*?)</ol>', lambda m: convert_ol(m.group(1)), content, flags=re.DOTALL)
    
    # Convert emphasis
    content = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', content, flags=re.DOTALL)
    content = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', content, flags=re.DOTALL)
    
    # Convert line breaks
    content = re.sub(r'<br\s*/?>', '\n', content)
    
    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)
    
    # Restore protected custom components
    for placeholder, component in custom_components.items():
        content = content.replace(placeholder, component)
    
    # Clean up whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    content = content.strip()
    
    return content

def convert_ul(ul_content):
    items = re.findall(r'<li[^>]*>(.*?)</li>', ul_content, flags=re.DOTALL)
    markdown_items = [f"- {item.strip()}" for item in items]
    return '\n'.join(markdown_items) + '\n\n'

def convert_ol(ol_content):
    items = re.findall(r'<li[^>]*>(.*?)</li>', ol_content, flags=re.DOTALL)
    markdown_items = [f"{i+1}. {item.strip()}" for i, item in enumerate(items)]
    return '\n'.join(markdown_items) + '\n\n'

def process_wordpress_xml_enhanced():
    """Enhanced WordPress XML processing with relationships and images"""
    
    tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
    root = tree.getroot()
    
    namespaces = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }
    
    items = root.findall('.//item')
    print(f"Found {len(items)} items to process...")
    
    # First pass: collect all areas to create lookup
    areas_lookup = {}  # id -> slug mapping
    
    for item in items:
        post_type_elem = item.find('wp:post_type', namespaces)
        if post_type_elem is None or post_type_elem.text != 'areas':
            continue
            
        title_elem = item.find('title')
        post_id_elem = item.find('wp:post_id', namespaces)
        
        if title_elem is not None and post_id_elem is not None:
            post_id = post_id_elem.text
            slug = clean_filename(title_elem.text)
            areas_lookup[post_id] = slug
    
    print(f"Found {len(areas_lookup)} areas for relationship mapping")
    
    # Second pass: process all content
    areas = []
    routes = []
    trip_plans = []
    trip_reports = []
    
    for item in items:
        post_type_elem = item.find('wp:post_type', namespaces)
        title_elem = item.find('title')
        
        if post_type_elem is None or title_elem is None:
            continue
            
        post_type = post_type_elem.text
        if post_type not in ['areas', 'routes', 'plans', 'reports']:
            continue
            
        title = title_elem.text
        print(f"Processing: {title} (type: {post_type})")
        
        # Extract enhanced content with relationships and images
        content, images, relationships = extract_relationships_and_images(item, namespaces)
        
        # Get post date
        post_date_elem = item.find('wp:post_date', namespaces)
        post_date = post_date_elem.text if post_date_elem is not None else '2019-01-01 00:00:00'
        date_part = post_date.split()[0]
        
        # Create content object with relationships
        if post_type == 'areas':
            area_data = {
                'title': title,
                'featuredImage': "",
                'summitCoords': relationships.get('summitCoords', ''),
                'mountainForecastUrl': relationships.get('mountainForecastUrl', ''),
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            areas.append(area_data)
            
        elif post_type == 'routes':
            # Map parent area ID to slug
            parent_area_slug = ""
            parent_id = relationships.get('parentArea', '')
            if parent_id and parent_id in areas_lookup:
                parent_area_slug = areas_lookup[parent_id]
            
            route_data = {
                'title': title,
                'featuredImage': "",
                'parentArea': parent_area_slug,  # Now properly mapped!
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            routes.append(route_data)
            
        elif post_type == 'plans':
            # Map destination IDs to slugs
            destination_slugs = []
            for dest_id in relationships.get('destinations', []):
                if dest_id in areas_lookup:
                    destination_slugs.append(areas_lookup[dest_id])
            
            plan_data = {
                'title': title,
                'featuredImage': "",
                'destinations': destination_slugs,  # Now properly mapped!
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            trip_plans.append(plan_data)
            
        elif post_type == 'reports':
            report_data = {
                'title': title,
                'featuredImage': "",
                'destinations': [],  # Could be mapped if relationship exists
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            trip_reports.append(report_data)
    
    return areas, routes, trip_plans, trip_reports

def clean_filename(title):
    """Clean title to create valid filename"""
    # Remove/replace invalid characters
    filename = re.sub(r'[^\w\s-]', '', title.lower())
    filename = re.sub(r'[-\s]+', '-', filename)
    return filename.strip('-')

def write_enhanced_mdx_file(content_obj, content_type, output_dir):
    """Write MDX file with enhanced frontmatter"""
    
    os.makedirs(output_dir, exist_ok=True)
    file_path = output_dir / content_obj['filename']
    
    # Create frontmatter based on content type
    frontmatter = ['---']
    frontmatter.append(f'title: "{content_obj["title"]}"')
    
    if content_type == 'area':
        if content_obj.get('summitCoords'):
            frontmatter.append(f'summitCoords: "{content_obj["summitCoords"]}"')
        if content_obj.get('mountainForecastUrl'):
            frontmatter.append(f'mountainForecastUrl: "{content_obj["mountainForecastUrl"]}"')
            
    elif content_type == 'route':
        if content_obj.get('parentArea'):
            frontmatter.append(f'parentArea: content/areas/{content_obj["parentArea"]}.mdx')
            
    elif content_type == 'trip-plan':
        if content_obj.get('destinations'):
            destinations_yaml = '[' + ', '.join([f'content/areas/{d}.mdx' for d in content_obj['destinations']]) + ']'
            frontmatter.append(f'destinations: {destinations_yaml}')
            
    elif content_type == 'trip-report':
        if content_obj.get('destinations'):
            destinations_yaml = '[' + ', '.join([f'content/areas/{d}.mdx' for d in content_obj['destinations']]) + ']'
            frontmatter.append(f'destinations: {destinations_yaml}')
    
    frontmatter.append('---')
    frontmatter.append('')
    frontmatter.append(content_obj['content'])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(frontmatter))
    
    print(f"Created: {file_path}")

def main():
    print("Enhanced WordPress to TinaCMS conversion starting...")
    
    # Process content
    areas, routes, trip_plans, trip_reports = process_wordpress_xml_enhanced()
    
    # Create output directories
    content_dir = Path("content")
    areas_dir = content_dir / "areas"
    routes_dir = content_dir / "routes"
    plans_dir = content_dir / "trip-plans"
    reports_dir = content_dir / "trip-reports"
    
    # Write files
    print(f"\nWriting {len(areas)} areas...")
    for area in areas:
        write_enhanced_mdx_file(area, 'area', areas_dir)
    
    print(f"\nWriting {len(routes)} routes...")
    for route in routes:
        write_enhanced_mdx_file(route, 'route', routes_dir)
    
    print(f"\nWriting {len(trip_plans)} trip plans...")
    for plan in trip_plans:
        write_enhanced_mdx_file(plan, 'trip-plan', plans_dir)
    
    print(f"\nWriting {len(trip_reports)} trip reports...")
    for report in trip_reports:
        write_enhanced_mdx_file(report, 'trip-report', reports_dir)
    
    print(f"\nEnhanced conversion complete!")
    print(f"Areas: {len(areas)}")
    print(f"Routes: {len(routes)} (with parent area relationships)")
    print(f"Trip Plans: {len(trip_plans)} (with destination relationships)")
    print(f"Trip Reports: {len(trip_reports)}")
    print(f"Images and betacreator blocks have been preserved!")

if __name__ == "__main__":
    main()