import os
import json
import shutil

# Load categories.json
with open('categories.json', 'r', encoding='utf-8') as f:
    categories_data = json.load(f)

base_dir = os.path.join('static', 'templates')

for category in categories_data['categories']:
    cat_id = category['id']
    for subcat in category['subcategories']:
        subcat_id = subcat['id']
        for item in subcat['items']:
            item_id = item['id']
            # Create the target directory
            target_dir = os.path.join(base_dir, cat_id, subcat_id, item_id)
            os.makedirs(target_dir, exist_ok=True)

            # Move images from old locations if they exist
            # 1. static/templates/{cat_id}/{item_id}/
            old_dir = os.path.join(base_dir, cat_id, item_id)
            if os.path.exists(old_dir):
                for fname in os.listdir(old_dir):
                    src = os.path.join(old_dir, fname)
                    dst = os.path.join(target_dir, fname)
                    if os.path.isfile(src):
                        print(f"Moving {src} -> {dst}")
                        shutil.move(src, dst)
                # Remove old dir if empty
                if not os.listdir(old_dir):
                    os.rmdir(old_dir)
            # 2. static/templates/{cat_id}/{item_id}_*.jpg
            parent_dir = os.path.join(base_dir, cat_id)
            if os.path.exists(parent_dir):
                for fname in os.listdir(parent_dir):
                    if fname.startswith(f"{item_id}_") and fname.lower().endswith(('.jpg', '.jpeg', '.png')):
                        src = os.path.join(parent_dir, fname)
                        dst = os.path.join(target_dir, fname)
                        if os.path.isfile(src):
                            print(f"Moving {src} -> {dst}")
                            shutil.move(src, dst) 