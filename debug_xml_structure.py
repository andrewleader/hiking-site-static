#!/usr/bin/env python3

import xml.etree.ElementTree as ET

def debug_xml_structure():
    print("Parsing XML structure...")
    
    tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
    root = tree.getroot()
    
    # Find the namespace
    ns = {'wp': 'http://wordpress.org/export/1.2/'}
    
    print(f"Root tag: {root.tag}")
    
    channel = root.find('channel')
    if channel is not None:
        print(f"Channel found with {len(list(channel))} children")
        
        # Look for items
        items = channel.findall('item')
        print(f"Found {len(items)} items")
        
        # Examine first few real content items
        content_items = []
        for item in items[:50]:  # Look at first 50 items
            post_type_elem = item.find('.//wp:post_type', ns)
            if post_type_elem is not None and post_type_elem.text in ['areas', 'routes', 'plans', 'reports']:
                content_items.append(item)
                
        print(f"Found {len(content_items)} content items in first 50")
        
        # Debug first content item
        if content_items:
            item = content_items[0]
            print("\n=== First content item structure ===")
            for child in item:
                print(f"- {child.tag}: {child.text[:100] if child.text else 'None'}...")
                
            # Check wp: namespace elements
            print("\n=== wp: namespace elements ===")
            wp_elements = item.findall('.//wp:*', ns)
            for elem in wp_elements:
                print(f"- {elem.tag}: {elem.text[:50] if elem.text else 'None'}...")
        
        # Find areas specifically
        areas = []
        for item in items:
            post_type_elem = item.find('.//wp:post_type', ns)
            if post_type_elem is not None and post_type_elem.text == 'areas':
                areas.append(item)
                
        print(f"\nFound {len(areas)} areas")
        if areas:
            area = areas[0]
            print("\n=== First area item ===")
            title_elem = area.find('title')
            print(f"Title: {title_elem.text if title_elem is not None else 'None'}")
            content_elem = area.find('.//content:encoded', {'content': 'http://purl.org/rss/1.0/modules/content/'})
            print(f"Content length: {len(content_elem.text) if content_elem is not None and content_elem.text else 0}")
            
            # Check postmeta
            postmetas = area.findall('.//wp:postmeta', ns)
            print(f"Postmeta items: {len(postmetas)}")
            for meta in postmetas[:5]:  # First 5 meta items
                key_elem = meta.find('wp:meta_key', ns)
                value_elem = meta.find('wp:meta_value', ns)
                key = key_elem.text if key_elem is not None else 'None'
                value = value_elem.text[:50] if value_elem is not None and value_elem.text else 'None'
                print(f"  {key}: {value}...")

if __name__ == "__main__":
    debug_xml_structure()