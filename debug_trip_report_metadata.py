#!/usr/bin/env python3
import xml.etree.ElementTree as ET

def debug_trip_report_metadata():
    """Debug trip report metadata to see what relationship keys are available"""
    
    tree = ET.parse('andrew039shikes.WordPress.2025-09-23.xml')
    root = tree.getroot()
    
    namespaces = {
        'wp': 'http://wordpress.org/export/1.2/',
        'content': 'http://purl.org/rss/1.0/modules/content/'
    }
    
    items = root.findall('.//item')
    print(f"Found {len(items)} total items")
    
    # Look for trip report items
    trip_report_count = 0
    for item in items:
        post_type_elem = item.find('wp:post_type', namespaces)
        if post_type_elem is None:
            continue
            
        post_type = post_type_elem.text
        if post_type == 'reports':
            trip_report_count += 1
            title_elem = item.find('title')
            title = title_elem.text if title_elem is not None else 'No title'
            
            print(f"\n=== Trip Report #{trip_report_count}: {title} ===")
            
            # Get all postmeta keys for this trip report
            postmetas = item.findall('wp:postmeta', namespaces)
            metadata_keys = set()
            
            for meta in postmetas:
                key_elem = meta.find('wp:meta_key', namespaces)
                value_elem = meta.find('wp:meta_value', namespaces)
                
                if key_elem is not None:
                    key = key_elem.text
                    value = value_elem.text or "" if value_elem is not None else ""
                    metadata_keys.add(key)
                    
                    # Show interesting metadata
                    if key in ['routes', 'plans', 'destinations', 'parent', 'tripplan', 'trip_plan']:
                        print(f"  {key}: {value}")
            
            # Show all unique keys for this trip report
            print(f"  All metadata keys: {sorted(metadata_keys)}")
            
            if trip_report_count >= 5:  # Just show first 5 for brevity
                break
    
    print(f"\nFound {trip_report_count} trip reports total")

if __name__ == "__main__":
    debug_trip_report_metadata()