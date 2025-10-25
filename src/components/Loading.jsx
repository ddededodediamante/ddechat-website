export default function Loading({ size = "40px" }) {
  return (
    <div className="loadingAnim" style={{ fontSize: size }}>
      <div className="spinner"></div>
      <div>Loading...</div>
    </div>
  );
}
