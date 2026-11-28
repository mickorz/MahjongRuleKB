// spike：3D 预览与本项目无关，返回空占位，避免把 model-viewer（1.2MB）打进包
export function ModelPreview(_props: { source: string; label: string; minHeight?: number }) {
  return null;
}
