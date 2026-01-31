export const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          fontSize: "18px",
          color: "#9ca3af",
        }}
      >
        {loading ? "Loading..." : 'Click "Calculate ROI" to see results'}
      </div>
    </>
  );
};

export default Loading;
