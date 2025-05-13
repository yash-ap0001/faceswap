"""
Face enhancement module for improving face quality after face swap.

This module provides face enhancement functionality using multiple models:
1. CodeFormer - For detailed face restoration
2. GFPGAN - For realistic face restoration

Both models are optional and the module will use whichever is available.
"""

import os
import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

class FaceEnhancer:
    """
    Face enhancement class that supports multiple models for improving face quality
    after face swapping.
    """
    
    def __init__(self):
        self.codeformer_model = None
        self.gfpgan_model = None
        self._load_models()
    
    def _load_models(self):
        """Load available enhancement models."""
        # Try to load CodeFormer
        codeformer_path = 'models/codeformer.onnx'
        if os.path.exists(codeformer_path):
            try:
                import onnxruntime as ort
                logger.info(f"Loading CodeFormer model from {codeformer_path}")
                self.codeformer_model = ort.InferenceSession(
                    codeformer_path, 
                    providers=['CPUExecutionProvider']
                )
                logger.info("CodeFormer model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load CodeFormer model: {e}")
        else:
            logger.warning(f"CodeFormer model not found at {codeformer_path}")
        
        # Try to load GFPGAN
        gfpgan_path = 'models/gfpgan_1.4.onnx'
        if os.path.exists(gfpgan_path):
            try:
                import onnxruntime as ort
                logger.info(f"Loading GFPGAN model from {gfpgan_path}")
                self.gfpgan_model = ort.InferenceSession(
                    gfpgan_path, 
                    providers=['CPUExecutionProvider']
                )
                logger.info("GFPGAN model loaded successfully")
            except Exception as e:
                logger.error(f"Failed to load GFPGAN model: {e}")
        else:
            logger.warning(f"GFPGAN model not found at {gfpgan_path}")
    
    def has_enhancement_models(self):
        """Check if any enhancement models are available."""
        return self.codeformer_model is not None or self.gfpgan_model is not None
    
    def preprocess(self, img):
        """Preprocess image for model input."""
        if img.shape[0] != 512 or img.shape[1] != 512:
            img = cv2.resize(img, (512, 512))
        
        # Convert to RGB if needed
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4:
            img = img[:, :, :3]
        elif img.shape[2] == 1:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        
        # Normalize to [0, 1]
        img = img.astype(np.float32) / 255.0
        
        # HWC to NCHW
        img = np.transpose(img, (2, 0, 1))
        img = np.expand_dims(img, axis=0)
        
        return img
    
    def postprocess(self, output, original_img):
        """Convert model output back to image."""
        # NCHW to HWC
        output = np.clip(output[0], 0, 1)
        output = np.transpose(output, (1, 2, 0))
        
        # Convert back to uint8
        output = (output * 255.0).astype(np.uint8)
        
        # Resize to original size if needed
        if output.shape[0] != original_img.shape[0] or output.shape[1] != original_img.shape[1]:
            output = cv2.resize(output, (original_img.shape[1], original_img.shape[0]))
        
        return output
    
    def enhance_with_codeformer(self, img, strength=0.7):
        """Enhance face using CodeFormer model."""
        if self.codeformer_model is None:
            logger.warning("CodeFormer model not loaded. Using basic enhancement.")
            return self._basic_enhance(img)
        
        try:
            # Preprocess
            input_img = self.preprocess(img)
            
            # Run inference
            outputs = self.codeformer_model.run(None, {'input': input_img})
            
            # Get enhanced face
            enhanced_face = outputs[0]
            
            # Postprocess
            enhanced_face = self.postprocess(enhanced_face, img)
            
            # Blend with original based on strength
            if strength < 1.0:
                enhanced_face = cv2.addWeighted(img, 1 - strength, enhanced_face, strength, 0)
            
            return enhanced_face
        except Exception as e:
            logger.error(f"Error enhancing with CodeFormer: {e}")
            return self._basic_enhance(img)
    
    def enhance_with_gfpgan(self, img, strength=0.7):
        """Enhance face using GFPGAN model."""
        if self.gfpgan_model is None:
            logger.warning("GFPGAN model not loaded. Using basic enhancement.")
            return self._basic_enhance(img)
        
        try:
            # Preprocess
            input_img = self.preprocess(img)
            
            # Run inference
            outputs = self.gfpgan_model.run(None, {'input': input_img})
            
            # Get enhanced face
            enhanced_face = outputs[0]
            
            # Postprocess
            enhanced_face = self.postprocess(enhanced_face, img)
            
            # Blend with original based on strength
            if strength < 1.0:
                enhanced_face = cv2.addWeighted(img, 1 - strength, enhanced_face, strength, 0)
            
            return enhanced_face
        except Exception as e:
            logger.error(f"Error enhancing with GFPGAN: {e}")
            return self._basic_enhance(img)
    
    def enhance(self, img, method='auto', strength=0.7):
        """
        Enhance a face image using the best available method.
        
        Args:
            img (np.ndarray): Input image
            method (str): Enhancement method - 'codeformer', 'gfpgan', or 'auto'
            strength (float): Enhancement strength from 0.0 to 1.0
            
        Returns:
            np.ndarray: Enhanced image or original if enhancement failed
        """
        if not self.has_enhancement_models():
            logger.warning("No enhancement models available. Using basic enhancement.")
            return self._basic_enhance(img)
        
        # Ensure strength is between 0 and 1
        strength = max(0.0, min(1.0, strength))
        
        if method == 'codeformer' and self.codeformer_model is not None:
            logger.info("Enhancing with CodeFormer")
            return self.enhance_with_codeformer(img, strength)
        
        elif method == 'gfpgan' and self.gfpgan_model is not None:
            logger.info("Enhancing with GFPGAN")
            return self.enhance_with_gfpgan(img, strength)
        
        else:  # Auto or requested model not available
            # Use whichever model is available, preferring CodeFormer
            if self.codeformer_model is not None:
                logger.info("Auto-enhancing with CodeFormer")
                return self.enhance_with_codeformer(img, strength)
            elif self.gfpgan_model is not None:
                logger.info("Auto-enhancing with GFPGAN")
                return self.enhance_with_gfpgan(img, strength)
            else:
                logger.warning("No enhancement models available. Using basic enhancement.")
                return self._basic_enhance(img)
    
    def _basic_enhance(self, img):
        """
        Apply basic image enhancements when no models are available.
        """
        # Simple color and contrast enhancement
        enhanced = img.copy()
        
        # Apply mild sharpening
        kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
        enhanced = cv2.filter2D(enhanced, -1, kernel)
        
        # Slight brightness and contrast adjustment
        alpha = 1.1  # Contrast control
        beta = 5    # Brightness control
        enhanced = cv2.convertScaleAbs(enhanced, alpha=alpha, beta=beta)
        
        # Remove noise
        enhanced = cv2.fastNlMeansDenoisingColored(enhanced, None, 5, 5, 7, 21)
        
        return enhanced