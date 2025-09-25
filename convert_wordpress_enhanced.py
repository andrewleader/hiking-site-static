#!/usr/bin/env python3

import xml.etree.ElementTree as ET
import re
import html
import json
from pathlib import Path
import os
from datetime import datetime

def format_date_for_tinacms(date_string):
    """Convert YYYYMMDD format to ISO 8601 format for TinaCMS"""
    if not date_string or len(date_string) != 8:
        return ""
    
    try:
        # Parse YYYYMMDD format
        year = int(date_string[:4])
        month = int(date_string[4:6])
        day = int(date_string[6:8])
        
        # Create datetime object and format as ISO 8601
        date_obj = datetime(year, month, day)
        return date_obj.strftime('%Y-%m-%dT00:00:00.000Z')
    except (ValueError, TypeError):
        return ""

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

def extract_coordinates_from_php_array(php_array_str):
    """Extract coordinates from PHP serialized array string"""
    if not php_array_str:
        return None
    
    lat = None
    lng = None
    
    # Try to extract lat - handle both string and double formats
    # Format 1: s:3:"lat";s:8:"48.23810" (string)
    lat_string_match = re.search(r's:3:"lat";s:\d+:"([^"]+)"', php_array_str)
    # Format 2: s:3:"lat";d:47.531316 (double)
    lat_double_match = re.search(r's:3:"lat";d:([^;]+)', php_array_str)
    
    if lat_string_match:
        try:
            lat = float(lat_string_match.group(1))
        except ValueError:
            pass
    elif lat_double_match:
        try:
            lat = float(lat_double_match.group(1))
        except ValueError:
            pass
    
    # Try to extract lng - handle both string and double formats  
    # Format 1: s:3:"lng";s:8:"-120.865" (string)
    lng_string_match = re.search(r's:3:"lng";s:\d+:"([^"]+)"', php_array_str)
    # Format 2: s:3:"lng";d:-123.245966 (double)
    lng_double_match = re.search(r's:3:"lng";d:([^;]+)', php_array_str)
    
    if lng_string_match:
        try:
            lng = float(lng_string_match.group(1))
        except ValueError:
            pass
    elif lng_double_match:
        try:
            lng = float(lng_double_match.group(1))
        except ValueError:
            pass
    
    if lat is not None and lng is not None:
        return f"{lat}, {lng}"
    
    return None

def extract_relationships_and_images(item, namespaces):
    """Extract relationship data, custom fields, and images from a WordPress item"""
    
    # Extract postmeta for relationships and custom fields
    postmetas = item.findall('wp:postmeta', namespaces)
    relationships = {}
    custom_fields = {}
    
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
            
            # Trip report relationships - use correct field names from WordPress
            elif key == 'destinations':  # Trip reports link to routes via 'destinations' field
                destinations = unserialize_php(value)
                relationships['destinations'] = destinations
            elif key == 'trip_plan':   # Trip reports link to trip plans via 'trip_plan' field  
                # trip_plan is just an ID, not serialized
                if value.strip():
                    relationships['trip_plan'] = value.strip()
            
            # Featured images
            elif key == '_thumbnail_id':
                relationships['featuredImageId'] = value
            
            # Custom fields for routes/areas/plans (from original script)
            elif key == 'miles':
                try:
                    custom_fields['miles'] = float(value) if value and value.replace('.', '').replace('-', '').isdigit() else None
                except:
                    custom_fields['miles'] = None
            elif key == 'elevation_gain':
                try:
                    custom_fields['gain'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    custom_fields['gain'] = None
            elif key == 'highest_elevation':
                try:
                    custom_fields['highestElevation'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    custom_fields['highestElevation'] = None
            elif key == 'class':
                if value and value.strip():
                    custom_fields['classRating'] = f"class{value.strip()}"
            elif key == 'yds_rating':
                custom_fields['ydsRating'] = value if value and value.strip() else None
            elif key == 'yds_sub_rating':
                custom_fields['ydsSubRating'] = value if value and value.strip() else None
            elif key == 'pitches':
                try:
                    custom_fields['pitches'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    custom_fields['pitches'] = None
            elif key == 'caltopo':
                custom_fields['calTopoUrl'] = value if value and value.strip() else None
            elif key == 'gpx':
                custom_fields['gpxFile'] = value if value and value.strip() else None
            elif key == 'mountain_forecast':
                custom_fields['mountainForecastUrl'] = value if value and value.strip() else None
            elif key == 'summit':
                # Handle PHP serialized array for coordinates (works for both areas and routes)
                coords = extract_coordinates_from_php_array(value)
                if coords:
                    custom_fields['summitCoords'] = coords
            elif key == 'parent_area':
                custom_fields['parentAreaId'] = value if value and value.strip() else None
            elif key == 'start_date':
                custom_fields['startDate'] = format_date_for_tinacms(value) if value and value.strip() else ""
            elif key == 'end_date':
                custom_fields['endDate'] = format_date_for_tinacms(value) if value and value.strip() else ""
    
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
        
        return content, images, relationships, custom_fields
    
    return "", [], relationships, custom_fields

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
    
    # Convert lists (handle nested lists properly while preserving formatting)
    content = convert_nested_lists(content)
    
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

def convert_nested_lists(content):
    """Convert all lists (ul/ol) while properly handling nesting"""
    def find_matching_tag(content, start_pos, tag_type):
        """Find the matching closing tag for a list, accounting for nesting"""
        if tag_type == 'ul':
            open_tag = '<ul'
            close_tag = '</ul>'
        else:
            open_tag = '<ol'
            close_tag = '</ol>'
        
        tag_count = 1
        pos = start_pos
        
        while pos < len(content) and tag_count > 0:
            next_open = content.find(open_tag, pos)
            next_close = content.find(close_tag, pos)
            
            if next_close == -1:
                return -1  # No matching closing tag found
            
            if next_open != -1 and next_open < next_close:
                # Found another opening tag before the closing tag
                tag_count += 1
                pos = next_open + len(open_tag)
            else:
                # Found a closing tag
                tag_count -= 1
                if tag_count == 0:
                    return next_close + len(close_tag)
                else:
                    pos = next_close + len(close_tag)
        
        return -1
    
    # Process all ul and ol tags from outermost to innermost
    pos = 0
    while pos < len(content):
        ul_pos = content.find('<ul', pos)
        ol_pos = content.find('<ol', pos)
        
        # Find which comes first
        if ul_pos == -1 and ol_pos == -1:
            break
        elif ul_pos == -1:
            next_pos = ol_pos
            tag_type = 'ol'
        elif ol_pos == -1:
            next_pos = ul_pos
            tag_type = 'ul'
        else:
            if ul_pos < ol_pos:
                next_pos = ul_pos
                tag_type = 'ul'
            else:
                next_pos = ol_pos
                tag_type = 'ol'
        
        # Find the end of the opening tag
        tag_end = content.find('>', next_pos)
        if tag_end == -1:
            break
        
        # Find the matching closing tag
        close_pos = find_matching_tag(content, tag_end + 1, tag_type)
        if close_pos == -1:
            pos = tag_end + 1
            continue
        
        # Extract the list content (between opening and closing tags)
        list_content = content[tag_end + 1:close_pos - (4 if tag_type == 'ul' else 5)]
        
        # Convert the list
        if tag_type == 'ul':
            markdown_list = convert_ul(list_content, 0)
        else:
            markdown_list = convert_ol(list_content, 0)
        
        # Replace the entire list with the markdown version
        full_list = content[next_pos:close_pos]
        content = content[:next_pos] + markdown_list + content[close_pos:]
        
        # Move position forward by the length of the replacement
        pos = next_pos + len(markdown_list)
    
    return content

def parse_li_items(content):
    """Parse <li> items properly handling nested structure"""
    items = []
    pos = 0
    
    while pos < len(content):
        # Find next <li> tag
        li_start = content.find('<li', pos)
        if li_start == -1:
            break
            
        # Find the end of the opening <li> tag
        tag_end = content.find('>', li_start)
        if tag_end == -1:
            break
            
        # Now find the matching </li> by counting nested <li> tags
        li_count = 1
        search_pos = tag_end + 1
        li_content_start = tag_end + 1
        
        while search_pos < len(content) and li_count > 0:
            next_li_open = content.find('<li', search_pos)
            next_li_close = content.find('</li>', search_pos)
            
            if next_li_close == -1:
                break
                
            # If there's an opening <li> before the closing </li>, count it
            if next_li_open != -1 and next_li_open < next_li_close:
                li_count += 1
                search_pos = next_li_open + 3
            else:
                li_count -= 1
                if li_count == 0:
                    # Found the matching closing tag
                    li_content = content[li_content_start:next_li_close]
                    items.append(li_content)
                    pos = next_li_close + 5  # Move past </li>
                    break
                else:
                    search_pos = next_li_close + 5
        
        if li_count > 0:
            # Couldn't find matching closing tag, take the rest
            li_content = content[li_content_start:]
            items.append(li_content)
            break
    
    return items

def convert_ul(ul_content, indent_level=0):
    """Convert unordered list with support for nested lists"""
    result_lines = []
    indent = "  " * indent_level
    
    # Use proper parsing that handles nested li tags correctly
    items = parse_li_items(ul_content)
    
    for item_content in items:
        # Check if this item contains nested lists
        if '<ul' in item_content or '<ol' in item_content:
            # Split the content at the first nested list
            nested_ul_match = re.search(r'(.*?)<ul[^>]*>(.*?)</ul>(.*)', item_content, flags=re.DOTALL)
            nested_ol_match = re.search(r'(.*?)<ol[^>]*>(.*?)</ol>(.*)', item_content, flags=re.DOTALL)
            
            if nested_ul_match:
                before, nested_content, after = nested_ul_match.groups()
                main_text = convert_inline_formatting((before + after).strip())
                
                # Always add the main item, even if text is empty
                result_lines.append(f"{indent}- {main_text}" if main_text else f"{indent}-")
                
                # Process nested list
                nested_result = convert_ul(nested_content, indent_level + 1)
                if nested_result.strip():
                    for line in nested_result.strip().split('\n'):
                        if line.strip():
                            result_lines.append(f"  {line}")
            
            elif nested_ol_match:
                before, nested_content, after = nested_ol_match.groups()
                main_text = convert_inline_formatting((before + after).strip())
                
                # Always add the main item, even if text is empty  
                result_lines.append(f"{indent}- {main_text}" if main_text else f"{indent}-")
                
                # Process nested list  
                nested_result = convert_ol(nested_content, indent_level + 1)
                if nested_result.strip():
                    for line in nested_result.strip().split('\n'):
                        if line.strip():
                            result_lines.append(f"  {line}")
        else:
            # Regular item without nesting
            clean_text = convert_inline_formatting(item_content.strip())
            if clean_text:
                result_lines.append(f"{indent}- {clean_text}")
    
    if indent_level == 0:
        return '\n'.join(result_lines) + '\n\n'
    else:
        return '\n'.join(result_lines)

def convert_ol(ol_content, indent_level=0):
    """Convert ordered list with support for nested lists"""
    result_lines = []
    indent = "  " * indent_level
    
    # Use proper parsing that handles nested li tags correctly
    items = parse_li_items(ol_content)
    
    for i, item_content in enumerate(items):
        # Check if this item contains nested lists
        if '<ul' in item_content or '<ol' in item_content:
            # Split the content at the first nested list
            nested_ul_match = re.search(r'(.*?)<ul[^>]*>(.*?)</ul>(.*)', item_content, flags=re.DOTALL)
            nested_ol_match = re.search(r'(.*?)<ol[^>]*>(.*?)</ol>(.*)', item_content, flags=re.DOTALL)
            
            if nested_ul_match:
                before, nested_content, after = nested_ul_match.groups()
                main_text = convert_inline_formatting((before + after).strip())
                
                # Always add the main item, even if text is empty
                result_lines.append(f"{indent}{i+1}. {main_text}" if main_text else f"{indent}{i+1}.")
                
                # Process nested list
                nested_result = convert_ul(nested_content, indent_level + 1)
                if nested_result.strip():
                    for line in nested_result.strip().split('\n'):
                        if line.strip():
                            result_lines.append(f"  {line}")
            
            elif nested_ol_match:
                before, nested_content, after = nested_ol_match.groups()
                main_text = convert_inline_formatting((before + after).strip())
                
                # Always add the main item, even if text is empty
                result_lines.append(f"{indent}{i+1}. {main_text}" if main_text else f"{indent}{i+1}.")
                
                # Process nested list
                nested_result = convert_ol(nested_content, indent_level + 1)
                if nested_result.strip():
                    for line in nested_result.strip().split('\n'):
                        if line.strip():
                            result_lines.append(f"  {line}")
        else:
            # Regular item without nesting
            clean_text = convert_inline_formatting(item_content.strip())
            if clean_text:
                result_lines.append(f"{indent}{i+1}. {clean_text}")
    
    if indent_level == 0:
        return '\n'.join(result_lines) + '\n\n'
    else:
        return '\n'.join(result_lines)

def convert_inline_formatting(text):
    """Convert inline HTML formatting to markdown while preserving it"""
    # Convert emphasis (preserve formatting)
    text = re.sub(r'<strong[^>]*>(.*?)</strong>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<b[^>]*>(.*?)</b>', r'**\1**', text, flags=re.DOTALL)
    text = re.sub(r'<em[^>]*>(.*?)</em>', r'*\1*', text, flags=re.DOTALL)
    text = re.sub(r'<i[^>]*>(.*?)</i>', r'*\1*', text, flags=re.DOTALL)
    
    # Convert links
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', text, flags=re.DOTALL)
    
    # Convert line breaks
    text = re.sub(r'<br\s*/?>', ' ', text)
    
    # Remove remaining simple HTML tags but preserve the content
    text = re.sub(r'<[^>]+>', '', text)
    
    return text.strip()

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
    
    # First pass: collect all areas, routes, and trip plans to create lookup
    areas_lookup = {}  # id -> slug mapping
    routes_lookup = {}  # id -> slug mapping
    plans_lookup = {}  # id -> slug mapping
    attachments_lookup = {}  # id -> URL mapping for images
    
    for item in items:
        post_type_elem = item.find('wp:post_type', namespaces)
        if post_type_elem is None:
            continue
            
        post_type = post_type_elem.text
        if post_type not in ['areas', 'routes', 'plans', 'attachment']:
            continue
        
        title_elem = item.find('title')
        post_id_elem = item.find('wp:post_id', namespaces)
        
        if title_elem is not None and post_id_elem is not None:
            post_id = post_id_elem.text
            
            if post_type == 'attachment':
                # Extract attachment URL for images
                attachment_url_elem = item.find('wp:attachment_url', namespaces)
                if attachment_url_elem is not None:
                    attachments_lookup[post_id] = attachment_url_elem.text
            else:
                slug = clean_filename(title_elem.text)
                
                if post_type == 'areas':
                    areas_lookup[post_id] = slug
                elif post_type == 'routes':
                    routes_lookup[post_id] = slug
                elif post_type == 'plans':
                    plans_lookup[post_id] = slug
    
    print(f"Found {len(areas_lookup)} areas, {len(routes_lookup)} routes, {len(plans_lookup)} plans, and {len(attachments_lookup)} attachments for relationship mapping")
    
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
        
        # Extract enhanced content with relationships, custom fields, and images
        content, images, relationships, custom_fields = extract_relationships_and_images(item, namespaces)
        
        # Get post date
        post_date_elem = item.find('wp:post_date', namespaces)
        post_date = post_date_elem.text if post_date_elem is not None else '2019-01-01 00:00:00'
        date_part = post_date.split()[0]
        
        # Get featured image URL if available
        featured_image_url = ""
        if 'featuredImageId' in relationships and relationships['featuredImageId']:
            featured_image_url = attachments_lookup.get(relationships['featuredImageId'], "")
            
        # Create content object with relationships and custom fields
        if post_type == 'areas':
            area_data = {
                'title': title,
                'featuredImage': featured_image_url,
                'summitCoords': custom_fields.get('summitCoords', ''),
                'mountainForecastUrl': custom_fields.get('mountainForecastUrl', ''),
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
            
            # Set classRating to "class5" if we have YDS ratings but no explicit class rating
            class_rating = custom_fields.get('classRating', '')
            if not class_rating and custom_fields.get('ydsRating'):
                class_rating = 'class5'
                
            route_data = {
                'title': title,
                'featuredImage': featured_image_url,
                'miles': custom_fields.get('miles'),
                'gain': custom_fields.get('gain'),
                'highestElevation': custom_fields.get('highestElevation'),
                'classRating': class_rating,
                'ydsRating': custom_fields.get('ydsRating', ''),
                'ydsSubRating': custom_fields.get('ydsSubRating', ''),
                'pitches': custom_fields.get('pitches'),
                'parentArea': parent_area_slug,  # Now properly mapped!
                'summitCoords': custom_fields.get('summitCoords', ''),
                'calTopoUrl': custom_fields.get('calTopoUrl', ''),
                'gpxFile': custom_fields.get('gpxFile', ''),
                'mountainForecastUrl': custom_fields.get('mountainForecastUrl', ''),
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            routes.append(route_data)
            
        elif post_type == 'plans':
            # Map destination IDs to route slugs
            destination_slugs = []
            for dest_id in relationships.get('destinations', []):
                if dest_id in routes_lookup:
                    destination_slugs.append(routes_lookup[dest_id])
            
            plan_data = {
                'title': title,
                'featuredImage': featured_image_url,
                'startDate': custom_fields.get('startDate', ''),
                'endDate': custom_fields.get('endDate', ''),
                'destinations': destination_slugs,  # Now properly mapped to routes!
                'content': content,
                'filename': f"{clean_filename(title)}.mdx"
            }
            trip_plans.append(plan_data)
            
        elif post_type == 'reports':
            # Map route destinations
            destination_slugs = []
            for route_id in relationships.get('destinations', []):
                if route_id in routes_lookup:
                    destination_slugs.append(routes_lookup[route_id])
            
            # Map trip plan relationship
            trip_plan_slug = ""
            trip_plan_id = relationships.get('trip_plan')
            if trip_plan_id and trip_plan_id in plans_lookup:
                trip_plan_slug = plans_lookup[trip_plan_id]
            
            report_data = {
                'title': title,
                'featuredImage': featured_image_url,
                'startDate': custom_fields.get('startDate', ''),
                'endDate': custom_fields.get('endDate', ''),
                'destinations': destination_slugs,  # Now properly mapped to routes!
                'tripPlan': trip_plan_slug,  # Now properly mapped to trip plan!
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
    """Write MDX file with enhanced frontmatter including all custom fields"""
    
    os.makedirs(output_dir, exist_ok=True)
    file_path = output_dir / content_obj['filename']
    
    # Create frontmatter based on content type
    frontmatter = ['---']
    frontmatter.append(f'title: "{content_obj["title"]}"')
    
    if content_type == 'area':
        # Add all non-empty custom fields for areas
        for key, value in content_obj.items():
            if key in ['title', 'content', 'filename']:
                continue
            if value is not None and value != '':
                if isinstance(value, str):
                    frontmatter.append(f'{key}: "{value}"')
                else:
                    frontmatter.append(f'{key}: {value}')
            
    elif content_type == 'route':
        # Add all route-specific fields, including custom fields from WordPress
        for key, value in content_obj.items():
            if key in ['title', 'content', 'filename']:
                continue
            if key == 'parentArea' and value:
                frontmatter.append(f'parentArea: content/areas/{value}.mdx')
            elif key == 'classRating':
                # Always include classRating for routes, even if empty
                frontmatter.append(f'classRating: "{value}"')
            elif value is not None and value != '':
                if isinstance(value, str):
                    frontmatter.append(f'{key}: "{value}"')
                else:
                    frontmatter.append(f'{key}: {value}')
            
    elif content_type == 'trip-plan':
        # Add all trip plan fields
        for key, value in content_obj.items():
            if key in ['title', 'content', 'filename', 'destinations']:
                continue
            if value is not None and value != '':
                if isinstance(value, str):
                    frontmatter.append(f'{key}: "{value}"')
                else:
                    frontmatter.append(f'{key}: {value}')
        
        # Handle destinations separately
        if content_obj.get('destinations'):
            frontmatter.append('destinations:')
            for d in content_obj['destinations']:
                frontmatter.append(f'  - route: content/routes/{d}.mdx')
            
    elif content_type == 'trip-report':
        # Add all trip report fields
        for key, value in content_obj.items():
            if key in ['title', 'content', 'filename', 'destinations', 'tripPlan']:
                continue
            if value is not None and value != '':
                if isinstance(value, str):
                    frontmatter.append(f'{key}: "{value}"')
                else:
                    frontmatter.append(f'{key}: {value}')
        
        # Handle tripPlan
        if content_obj.get('tripPlan'):
            frontmatter.append(f'tripPlan: content/trip-plans/{content_obj["tripPlan"]}.mdx')
        else:
            frontmatter.append('tripPlan: ""')
            
        # Handle destinations
        if content_obj.get('destinations'):
            frontmatter.append('destinations:')
            for d in content_obj['destinations']:
                frontmatter.append(f'  - route: content/routes/{d}.mdx')
    
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