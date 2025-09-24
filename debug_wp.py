#!/usr/bin/env python3
"""
Simple WordPress XML Debug Script
"""

import xml.etree.ElementTree as ET

def debug_wordpress_xml(xml_file_path):
    """Debug the WordPress XML file structure"""
    
    # Parse XML
    tree = ET.parse(xml_file_path)
    root = tree.getroot()
    
    # Find all items
    items = root.findall('.//item')
    
    print(f"Found {len(items)} items")
    
    post_types = {}
    
    for i, item in enumerate(items):  # Look at ALL items
        title_elem = item.find('title')
        post_type_elem = item.find('.//{http://wordpress.org/export/1.2/}post_type')
        
        title = title_elem.text if title_elem is not None else "No title"
        post_type = post_type_elem.text if post_type_elem is not None else "No post_type"
        
        # Only print actual content items, skip ACF fields
        if post_type not in ['acf-field', 'acf-field-group']:
            print(f"{i+1}. Title: '{title}' | Type: '{post_type}'")
        
        # Count post types
        if post_type in post_types:
            post_types[post_type] += 1
        else:
            post_types[post_type] = 1
    
    print("\nPost type summary:")
    for post_type, count in post_types.items():
        print(f"  {post_type}: {count}")

if __name__ == "__main__":
    debug_wordpress_xml("andrew039shikes.WordPress.2025-09-23.xml")