export default function Loading({ size = "40px", iconOnly = false }) {
  return (
    <div className="loadingAnim" style={{ fontSize: size }}>
      <div className="spinner"></div>
      {iconOnly === false && <div>Loading...</div>}
    </div>
  );
}
