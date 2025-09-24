#!/usr/bin/env python3
"""
WordPress to TinaCMS Converter
Converts WordPress XML export to TinaCMS MDX files for Andrew's Adventures
"""

import xml.etree.ElementTree as ET
import re
import html
from pathlib import Path
import json
from datetime import datetime

def clean_filename(title):
    """Convert title to clean filename"""
    filename = re.sub(r'[^\w\s-]', '', title.lower())
    filename = re.sub(r'[-\s]+', '-', filename)
    return filename.strip('-')

def html_to_markdown_basic(html_content):
    """Basic HTML to Markdown conversion"""
    if not html_content:
        return ""
    
    # Unescape HTML entities
    content = html.unescape(html_content)
    
    # Remove WordPress comment blocks
    content = re.sub(r'<!-- wp:.*?-->', '', content, flags=re.DOTALL)
    
    # Convert headings
    content = re.sub(r'<h2[^>]*>(.*?)</h2>', r'## \1', content, flags=re.DOTALL)
    content = re.sub(r'<h3[^>]*>(.*?)</h3>', r'### \1', content, flags=re.DOTALL)
    
    # Convert paragraphs
    content = re.sub(r'<p[^>]*>(.*?)</p>', r'\1\n\n', content, flags=re.DOTALL)
    
    # Convert lists
    content = re.sub(r'<ul[^>]*>(.*?)</ul>', lambda m: convert_list(m.group(1), '-'), content, flags=re.DOTALL)
    content = re.sub(r'<ol[^>]*>(.*?)</ol>', lambda m: convert_list(m.group(1), '1.'), content, flags=re.DOTALL)
    
    # Convert links
    content = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', content, flags=re.DOTALL)
    
    # Convert blockquotes
    content = re.sub(r'<blockquote[^>]*>(.*?)</blockquote>', lambda m: quote_content(m.group(1)), content, flags=re.DOTALL)
    
    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)
    
    # Clean up extra whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content.strip()

def convert_list(list_content, marker):
    """Convert HTML list to markdown"""
    items = re.findall(r'<li[^>]*>(.*?)</li>', list_content, re.DOTALL)
    markdown_list = []
    for item in items:
        clean_item = re.sub(r'<[^>]+>', '', item).strip()
        if marker == '1.':
            markdown_list.append(f"1. {clean_item}")
        else:
            markdown_list.append(f"- {clean_item}")
    return '\n' + '\n'.join(markdown_list) + '\n\n'

def quote_content(content):
    """Convert blockquote content"""
    clean = re.sub(r'<[^>]+>', '', content).strip()
    lines = clean.split('\n')
    quoted = '\n'.join(f"> {line}" if line.strip() else '>' for line in lines)
    return f"\n{quoted}\n\n"

def extract_coordinates_from_php_array(php_array_str):
    """Extract coordinates from PHP serialized array string"""
    if not php_array_str:
        return None
    
    # Simple regex to extract lat and lng from the serialized string
    import re
    lat_match = re.search(r's:3:"lat";s:\d+:"([^"]+)"', php_array_str)
    lng_match = re.search(r's:3:"lng";s:\d+:"([^"]+)"', php_array_str)
    
    if lat_match and lng_match:
        try:
            lat = float(lat_match.group(1))
            lng = float(lng_match.group(1))
            return f"{lat}, {lng}"
        except ValueError:
            return None
    
    return None

def extract_custom_fields(post):
    """Extract WordPress custom fields"""
    fields = {}
    
    # Look for wp:postmeta elements
    for meta in post.findall('.//{http://wordpress.org/export/1.2/}postmeta'):
        key_elem = meta.find('.//{http://wordpress.org/export/1.2/}meta_key')
        value_elem = meta.find('.//{http://wordpress.org/export/1.2/}meta_value')
        
        if key_elem is not None and value_elem is not None:
            key = key_elem.text
            value = value_elem.text or ''
            
            # Map WordPress custom fields to TinaCMS fields
            if key == 'miles':
                try:
                    fields['miles'] = float(value) if value and value.replace('.', '').replace('-', '').isdigit() else None
                except:
                    fields['miles'] = None
            elif key == 'elevation_gain':
                try:
                    fields['gain'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    fields['gain'] = None
            elif key == 'highest_elevation':
                try:
                    fields['highestElevation'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    fields['highestElevation'] = None
            elif key == 'class':
                if value and value.strip():
                    fields['classRating'] = f"class{value.strip()}"
            elif key == 'yds_rating':
                fields['ydsRating'] = value if value and value.strip() else None
            elif key == 'yds_sub_rating':
                fields['ydsSubRating'] = value if value and value.strip() else None
            elif key == 'pitches':
                try:
                    fields['pitches'] = int(value) if value and value.replace('-', '').isdigit() else None
                except:
                    fields['pitches'] = None
            elif key == 'caltopo':
                fields['calTopoUrl'] = value if value and value.strip() else None
            elif key == 'gpx':
                fields['gpxFile'] = value if value and value.strip() else None
            elif key == 'mountain_forecast':
                fields['mountainForecastUrl'] = value if value and value.strip() else None
            elif key == 'summit':
                # Handle PHP serialized array for coordinates
                coords = extract_coordinates_from_php_array(value)
                if coords:
                    fields['summitCoords'] = coords
            elif key == 'parent_area':
                fields['parentAreaId'] = value if value and value.strip() else None
    
    return fields

def process_wordpress_xml(xml_file_path):
    """Process the WordPress XML file and convert to TinaCMS format"""
    
    # Parse XML
    try:
        tree = ET.parse(xml_file_path)
        root = tree.getroot()
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return [], [], [], []
    
    # Define namespaces
    namespaces = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }
    
    # Find all items (posts)
    items = root.findall('.//item')
    
    areas = []
    routes = []
    trip_plans = []
    trip_reports = []
    area_lookup = {}
    
    print(f"Found {len(items)} items to process...")
    
    for item in items:
        # Get basic post info
        title_elem = item.find('title')
        content_elem = item.find('.//{http://purl.org/rss/1.0/modules/content/}encoded')
        post_type_elem = item.find('.//{http://wordpress.org/export/1.2/}post_type')
        post_name_elem = item.find('.//{http://wordpress.org/export/1.2/}post_name')
        
        if title_elem is None or post_type_elem is None:
            continue
            
        title = title_elem.text or "Untitled"
        post_type = post_type_elem.text
        content = content_elem.text if content_elem is not None else ""
        post_name = post_name_elem.text if post_name_elem is not None else clean_filename(title)
        
        # Skip non-content post types
        if post_type in ['acf-field', 'acf-field-group', 'attachment', 'revision', 'nav_menu_item']:
            continue
            
        print(f"Processing: {title} (type: {post_type})")
        
        # Extract custom fields
        custom_fields = extract_custom_fields(item)
        
        # Convert HTML content to Markdown
        markdown_content = html_to_markdown_basic(content)
        
        # Process based on post type
        if post_type == 'areas':
            # This is an area
            area_data = {
                'title': title,
                'featuredImage': "",
                'summitCoords': custom_fields.get('summitCoords', ''),
                'mountainForecastUrl': custom_fields.get('mountainForecastUrl', ''),
                'content': markdown_content,
                'filename': clean_filename(title)
            }
            areas.append(area_data)
            area_lookup[title] = area_data['filename']
            
        elif post_type == 'peaks' or post_type == 'routes' or ('peak' in title.lower() or 'mountain' in title.lower() or 'spire' in title.lower() or 'dome' in title.lower() or any(word in title.lower() for word in ['wall', 'tower', 'needle', 'horn'])):
            # This looks like a route/peak
            route_data = {
                'title': title,
                'featuredImage': "",
                'miles': custom_fields.get('miles'),
                'gain': custom_fields.get('gain'),
                'highestElevation': custom_fields.get('highestElevation'),
                'classRating': custom_fields.get('classRating', ''),
                'ydsRating': custom_fields.get('ydsRating', ''),
                'ydsSubRating': custom_fields.get('ydsSubRating', ''),
                'pitches': custom_fields.get('pitches'),
                'parentArea': '',  # Will be resolved later
                'calTopoUrl': custom_fields.get('calTopoUrl', ''),
                'gpxFile': custom_fields.get('gpxFile', ''),
                'mountainForecastUrl': custom_fields.get('mountainForecastUrl', ''),
                'content': markdown_content,
                'filename': clean_filename(title)
            }
            routes.append(route_data)
            
        elif post_type == 'plans':
            # This is a trip plan
            plan_data = {
                'title': title,
                'featuredImage': "",
                'startDate': custom_fields.get('startDate', ''),
                'endDate': custom_fields.get('endDate', ''),
                'destinations': [],  # Will need special handling
                'content': markdown_content,
                'filename': clean_filename(title)
            }
            trip_plans.append(plan_data)
            
        elif post_type == 'reports':
            # This is a trip report
            report_data = {
                'title': title,
                'featuredImage': "",
                'startDate': custom_fields.get('startDate', ''),
                'endDate': custom_fields.get('endDate', ''),
                'tripPlan': '',  # Will need special handling
                'destinations': [],  # Will need special handling
                'content': markdown_content,
                'filename': clean_filename(title)
            }
            trip_reports.append(report_data)
    
    return areas, routes, trip_plans, trip_reports

def write_mdx_file(data, content_type, output_dir):
    """Write a single MDX file"""
    filename = f"{data['filename']}.mdx"
    filepath = output_dir / filename
    
    # Create frontmatter
    frontmatter = ['---']
    frontmatter.append(f'title: "{data["title"]}"')
    
    for key, value in data.items():
        if key in ['title', 'content', 'filename']:
            continue
        if value is not None and value != '':
            if isinstance(value, str):
                frontmatter.append(f'{key}: "{value}"')
            else:
                frontmatter.append(f'{key}: {value}')
    
    frontmatter.append('---')
    
    # Combine frontmatter and content
    full_content = '\n'.join(frontmatter) + '\n\n' + data['content']
    
    # Write file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)
    
    print(f"Created: {filepath}")

def main():
    xml_path = Path("andrew039shikes.WordPress.2025-09-23.xml")
    
    if not xml_path.exists():
        print(f"XML file not found: {xml_path}")
        return
    
    # Process the XML
    areas, routes, trip_plans, trip_reports = process_wordpress_xml(xml_path)
    
    # Create output directories
    content_dir = Path("content")
    areas_dir = content_dir / "areas"
    routes_dir = content_dir / "routes"
    plans_dir = content_dir / "trip-plans"
    reports_dir = content_dir / "trip-reports"
    
    # Write all the files
    print(f"\nWriting {len(areas)} areas...")
    for area in areas:
        write_mdx_file(area, 'area', areas_dir)
    
    print(f"\nWriting {len(routes)} routes...")
    for route in routes:
        write_mdx_file(route, 'route', routes_dir)
    
    print(f"\nWriting {len(trip_plans)} trip plans...")
    for plan in trip_plans:
        write_mdx_file(plan, 'trip-plan', plans_dir)
    
    print(f"\nWriting {len(trip_reports)} trip reports...")
    for report in trip_reports:
        write_mdx_file(report, 'trip-report', reports_dir)
    
    print(f"\nConversion complete!")
    print(f"Areas: {len(areas)}")
    print(f"Routes: {len(routes)}")
    print(f"Trip Plans: {len(trip_plans)}")
    print(f"Trip Reports: {len(trip_reports)}")

if __name__ == "__main__":
    main()