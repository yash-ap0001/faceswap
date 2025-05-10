import os
import shutil
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def organize_template_images():
    """
    Organize the attached assets into proper template structure
    """
    assets_dir = 'attached_assets'
    templates_dir = 'uploads/templates'
    
    if not os.path.exists(assets_dir):
        logger.error(f"Attached assets directory {assets_dir} does not exist")
        return 0
    
    # Ensure templates directories exist
    os.makedirs(templates_dir, exist_ok=True)
    os.makedirs(os.path.join(templates_dir, 'real'), exist_ok=True)
    os.makedirs(os.path.join(templates_dir, 'natural'), exist_ok=True)
    os.makedirs(os.path.join(templates_dir, 'ai'), exist_ok=True)
    
    # Map assets to ceremony types
    ceremony_mapping = {
        'weeding saree.jpg': {'ceremony': 'wedding', 'type': 'real'},
        'voni dress.jpg': {'ceremony': 'reception', 'type': 'real'},
        'jewellary.jpg': {'ceremony': 'wedding', 'type': 'natural'},
        'halfhand.jpg': {'ceremony': 'mehendi', 'type': 'real'},
        'full dress.jpg': {'ceremony': 'sangeeth', 'type': 'real'},
    }
    
    copied_count = 0
    
    # Process each image in attached_assets directory
    for filename in os.listdir(assets_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')) and filename in ceremony_mapping:
            file_path = os.path.join(assets_dir, filename)
            mapping = ceremony_mapping[filename]
            ceremony = mapping['ceremony']
            template_type = mapping['type']
            
            # Copy to type subdirectory
            subdir_path = os.path.join(templates_dir, template_type)
            dest_path = os.path.join(subdir_path, f"{ceremony}.jpg")
            
            # Also copy to root directory with the naming convention
            root_dest_path = os.path.join(templates_dir, f"{ceremony}_{template_type}.jpg")
            
            try:
                # Copy to subdirectory
                shutil.copy(file_path, dest_path)
                logger.info(f"Copied {file_path} to {dest_path}")
                
                # Copy to root with naming convention
                shutil.copy(file_path, root_dest_path)
                logger.info(f"Copied {file_path} to {root_dest_path}")
                
                copied_count += 1
            except Exception as e:
                logger.error(f"Error copying {file_path}: {str(e)}")
    
    # Create missing ceremony types from duplicates if needed
    ceremonies = ['haldi', 'mehendi', 'sangeeth', 'wedding', 'reception']
    types = ['real', 'natural', 'ai']
    
    # Check which ones are missing
    missing_templates = []
    for ceremony in ceremonies:
        for template_type in types:
            template_path = os.path.join(templates_dir, f"{ceremony}_{template_type}.jpg")
            if not os.path.exists(template_path):
                missing_templates.append((ceremony, template_type))
    
    # Fill in missing templates
    sources = {}
    for ceremony in ceremonies:
        for template_type in types:
            template_path = os.path.join(templates_dir, f"{ceremony}_{template_type}.jpg")
            if os.path.exists(template_path):
                if template_type not in sources:
                    sources[template_type] = []
                sources[template_type].append((ceremony, template_path))
    
    for ceremony, template_type in missing_templates:
        # Find a source to duplicate
        if template_type in sources and sources[template_type]:
            source_ceremony, source_path = sources[template_type][0]
            if source_ceremony != ceremony:  # Don't duplicate from the same ceremony
                dest_path = os.path.join(templates_dir, f"{ceremony}_{template_type}.jpg")
                try:
                    shutil.copy(source_path, dest_path)
                    logger.info(f"Created missing template: {dest_path} (duplicated from {source_path})")
                    
                    # Also copy to subdirectory
                    subdir_path = os.path.join(templates_dir, template_type, f"{ceremony}.jpg")
                    os.makedirs(os.path.join(templates_dir, template_type), exist_ok=True)
                    shutil.copy(source_path, subdir_path)
                    logger.info(f"Created missing template in subdirectory: {subdir_path}")
                    
                    copied_count += 1
                except Exception as e:
                    logger.error(f"Error creating missing template {dest_path}: {str(e)}")
    
    logger.info(f"Organized {copied_count} template images")
    return copied_count

if __name__ == "__main__":
    organize_template_images()