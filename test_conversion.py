#!/usr/bin/env python3

import xml.etree.ElementTree as ET

def test_conversion():
    print("Testing conversion with detailed logging...")
    
    tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
    root = tree.getroot()
    
    # Define namespaces
    namespaces = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }
    
    # Find all items
    items = root.findall('.//item')
    print(f"Found {len(items)} items")
    
    areas_count = 0
    routes_count = 0
    plans_count = 0
    reports_count = 0
    
    for i, item in enumerate(items):
        # Get basic post info using correct namespace
        title_elem = item.find('title')
        post_type_elem = item.find('wp:post_type', namespaces)
        
        if i < 10:  # Debug first 10 items
            print(f"\nItem {i}:")
            print(f"  title_elem: {title_elem} (text: {title_elem.text if title_elem is not None else 'None'})")
            print(f"  post_type_elem: {post_type_elem} (text: {post_type_elem.text if post_type_elem is not None else 'None'})")
        
        # Use proper None checks
        if title_elem is None or post_type_elem is None:
            continue
            
        title = title_elem.text or "Untitled"
        post_type = post_type_elem.text
        
        if i < 10:
            print(f"  Processing: {title} (type: {post_type})")
        
        # Count by type
        if post_type == 'areas':
            areas_count += 1
        elif post_type == 'routes':
            routes_count += 1
        elif post_type == 'plans':
            plans_count += 1
        elif post_type == 'reports':
            reports_count += 1
    
    print(f"\nFinal counts:")
    print(f"Areas: {areas_count}")
    print(f"Routes: {routes_count}")
    print(f"Plans: {plans_count}")
    print(f"Reports: {reports_count}")

if __name__ == "__main__":
    test_conversion()