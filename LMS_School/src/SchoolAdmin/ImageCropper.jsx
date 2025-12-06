import React, { useRef, useState, useEffect } from "react";
import AvatarEditor from "react-avatar-editor";
import "./ImageCropper.css";

const ImageCropper = ({ image, onSave, onClose }) => {
  const editorRef = useRef(null);
  const [scale, setScale] = useState(1.2);
  const [img, setImg] = useState(null);

  useEffect(() => {
    if (image) {
      const imgURL = typeof image === "string" ? image : URL.createObjectURL(image);
      setImg(imgURL);
    }
  }, [image]);

  const handleCrop = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const croppedImage = canvas.toDataURL("image/jpeg");
      onSave(croppedImage);
    }
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        <h3>Crop Profile Photo</h3>

        {img && (
          <AvatarEditor
            ref={editorRef}
            image={img}
            width={250}
            height={250}
            border={40}
            borderRadius={125} // circle crop
            scale={scale}
          />
        )}

        <div className="slider-box">
          <label>Zoom:</label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
          />
        </div>

        <div className="crop-buttons">
          <button className="save-btn" onClick={handleCrop}>Crop & Save</button>
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
