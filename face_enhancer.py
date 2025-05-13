import os
import cv2
import logging
import numpy as np
from pathlib import Path
import onnxruntime as ort

logger = logging.getLogger(__name__)

class FaceEnhancer:
    """
    Face enhancement class that supports multiple models for improving face quality
    after face swapping.
    """
    
    def __init__(self):
        self.models_dir = Path("models/enhancement")
        self.codeformer_model_path = self.models_dir / "faster_codeformer_onnx.onnx"
        self.gfpgan_model_path = self.models_dir / "gfpgan_1.4.onnx"
        
        self.codeformer_session = None
        self.gfpgan_session = None
        
        # Try to load available models
        self._load_models()
    
    def _load_models(self):
        """Load available enhancement models."""
        try:
            if self.codeformer_model_path.exists():
                logger.info(f"Loading CodeFormer model from {self.codeformer_model_path}")
                self.codeformer_session = ort.InferenceSession(
                    str(self.codeformer_model_path),
                    providers=['CPUExecutionProvider']
                )
                logger.info("CodeFormer model loaded successfully")
            else:
                logger.warning(f"CodeFormer model not found at {self.codeformer_model_path}")
                
            if self.gfpgan_model_path.exists():
                logger.info(f"Loading GFPGAN model from {self.gfpgan_model_path}")
                self.gfpgan_session = ort.InferenceSession(
                    str(self.gfpgan_model_path),
                    providers=['CPUExecutionProvider']
                )
                logger.info("GFPGAN model loaded successfully")
            else:
                logger.warning(f"GFPGAN model not found at {self.gfpgan_model_path}")
                
        except Exception as e:
            logger.error(f"Error loading enhancement models: {str(e)}")
    
    def has_enhancement_models(self):
        """Check if any enhancement models are available."""
        return self.codeformer_session is not None or self.gfpgan_session is not None
    
    def preprocess(self, img):
        """Preprocess image for model input."""
        # Convert to RGB if needed
        if len(img.shape) == 2:
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
            
        # Resize to 512x512
        h, w = img.shape[:2]
        if h != 512 or w != 512:
            img = cv2.resize(img, (512, 512))
            
        # Normalize to [0, 1]
        img_norm = img.astype(np.float32) / 255.0
        
        # Transpose to NCHW format
        img_norm = np.transpose(img_norm, (2, 0, 1))
        img_norm = np.expand_dims(img_norm, axis=0)
        
        return img_norm
    
    def postprocess(self, output, original_img):
        """Convert model output back to image."""
        # Get output from NCHW to HWC
        output = np.squeeze(output)
        output = np.transpose(output, (1, 2, 0))
        
        # Denormalize
        output = np.clip(output * 255.0, 0, 255).astype(np.uint8)
        
        # Resize back to original dimensions if needed
        h, w = original_img.shape[:2]
        if output.shape[0] != h or output.shape[1] != w:
            output = cv2.resize(output, (w, h))
            
        return output
    
    def enhance_with_codeformer(self, img, strength=0.7):
        """Enhance face using CodeFormer model."""
        if self.codeformer_session is None:
            logger.warning("CodeFormer model not loaded, returning original image")
            return img
            
        try:
            # Preprocess
            input_tensor = self.preprocess(img)
            
            # Run inference
            outputs = self.codeformer_session.run(None, {"input": input_tensor})
            enhanced = outputs[0]
            
            # Postprocess
            enhanced_img = self.postprocess(enhanced, img)
            
            # Blend with original based on strength
            if strength < 1.0:
                enhanced_img = cv2.addWeighted(img, 1 - strength, enhanced_img, strength, 0)
                
            return enhanced_img
        except Exception as e:
            logger.error(f"Error enhancing with CodeFormer: {str(e)}")
            return img
    
    def enhance_with_gfpgan(self, img, strength=0.7):
        """Enhance face using GFPGAN model."""
        if self.gfpgan_session is None:
            logger.warning("GFPGAN model not loaded, returning original image")
            return img
            
        try:
            # Preprocess
            input_tensor = self.preprocess(img)
            
            # Run inference
            outputs = self.gfpgan_session.run(None, {"input": input_tensor})
            enhanced = outputs[0]
            
            # Postprocess
            enhanced_img = self.postprocess(enhanced, img)
            
            # Blend with original based on strength
            if strength < 1.0:
                enhanced_img = cv2.addWeighted(img, 1 - strength, enhanced_img, strength, 0)
                
            return enhanced_img
        except Exception as e:
            logger.error(f"Error enhancing with GFPGAN: {str(e)}")
            return img
    
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
        if method == 'codeformer' and self.codeformer_session is not None:
            return self.enhance_with_codeformer(img, strength)
        elif method == 'gfpgan' and self.gfpgan_session is not None:
            return self.enhance_with_gfpgan(img, strength)
        elif method == 'auto':
            # Try CodeFormer first, then GFPGAN
            if self.codeformer_session is not None:
                return self.enhance_with_codeformer(img, strength)
            elif self.gfpgan_session is not None:
                return self.enhance_with_gfpgan(img, strength)
        
        # Fallback: return original image with basic enhancements
        return self._basic_enhance(img)
    
    def _basic_enhance(self, img):
        """
        Apply basic image enhancements when no models are available.
        """
        try:
            # Gaussian blur for slight smoothing
            blurred = cv2.GaussianBlur(img, (0, 0), 3)
            # Sharpen the image
            sharpened = cv2.addWeighted(img, 1.5, blurred, -0.5, 0)
            # Slight color enhancement
            lab = cv2.cvtColor(sharpened, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            # Increase contrast on L channel
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            # Merge channels
            enhanced_lab = cv2.merge((cl, a, b))
            enhanced = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
            return enhanced
        except Exception as e:
            logger.error(f"Error applying basic enhancement: {str(e)}")
            return img

# Create a singleton instance
enhancer = FaceEnhancer()