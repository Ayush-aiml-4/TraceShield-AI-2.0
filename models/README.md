# TraceShield Local AI Models Directory

TraceShield AI strictly avoids automatic model downloads from third-party hubs at runtime.
To deploy a local model for physical Snapdragon NPU validation:

1. Place your ONNX model file into this directory:
   - `models/dbnet_ocr.onnx` or `models/mobilenetv4_ocr.onnx` (OCR candidate)
   - `models/smollm2_qnn.onnx` or `models/smollm2.onnx` (SmolLM2 candidate)
   - `models/minilm_l6_v2.onnx` or `models/all-minilm.onnx` (MiniLM candidate)

2. Run the physical validation runner:
   powershell -ExecutionPolicy Bypass -File scripts/runWindowsSnapdragonValidation.ps1

If no models are populated in this directory, TraceShield AI runs on the deterministic CPU path.
