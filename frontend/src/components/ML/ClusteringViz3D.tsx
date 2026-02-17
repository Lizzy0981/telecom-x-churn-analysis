// frontend/src/components/ML/ClusteringViz3D.tsx
import React, { useEffect, useRef } from 'react';

export interface ClusterPoint {
  x: number;
  y: number;
  z: number;
  cluster: number;
  label?: string;
  customerId?: string;
}

export interface ClusteringViz3DProps {
  data?: ClusterPoint[];
  title?: string;
  width?: number;
  height?: number;
  loading?: boolean;
}

const generateMockData = (): ClusterPoint[] => {
  const clusters = 4;
  const pointsPerCluster = 50;
  const data: ClusterPoint[] = [];

  for (let c = 0; c < clusters; c++) {
    const centerX = (Math.random() - 0.5) * 10;
    const centerY = (Math.random() - 0.5) * 10;
    const centerZ = (Math.random() - 0.5) * 10;

    for (let i = 0; i < pointsPerCluster; i++) {
      data.push({
        x: centerX + (Math.random() - 0.5) * 3,
        y: centerY + (Math.random() - 0.5) * 3,
        z: centerZ + (Math.random() - 0.5) * 3,
        cluster: c,
        customerId: `CUST-${c}-${i}`,
        label: `Cluster ${c + 1}`
      });
    }
  }

  return data;
};

export const ClusteringViz3D: React.FC<ClusteringViz3DProps> = ({
  data = generateMockData(),
  title = '3D Customer Clustering',
  width = 800,
  height = 600,
  loading = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastMouse, setLastMouse] = React.useState({ x: 0, y: 0 });

  const clusterColors = [
    '#667eea', // Purple
    '#22c55e', // Green
    '#f59e0b', // Orange
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#ec4899'  // Pink
  ];

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, width, height);

    // Simple 3D projection
    const centerX = width / 2;
    const centerY = height / 2;
    const scale = 40;

    // Rotate and project points
    data.forEach((point) => {
      const rotatedX = point.x * Math.cos(rotation.y) - point.z * Math.sin(rotation.y);
      const rotatedZ = point.x * Math.sin(rotation.y) + point.z * Math.cos(rotation.y);
      const rotatedY = point.y * Math.cos(rotation.x) - rotatedZ * Math.sin(rotation.x);

      const projectedX = centerX + rotatedX * scale;
      const projectedY = centerY - rotatedY * scale;

      // Draw point
      const color = clusterColors[point.cluster % clusterColors.length];
      const size = 4 + (rotatedZ + 10) / 5; // Depth effect

      ctx.beginPath();
      ctx.arc(projectedX, projectedY, size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Draw axes
    drawAxes(ctx, centerX, centerY, scale, rotation);
  }, [data, rotation, width, height, loading]);

  const drawAxes = (ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number, rot: any) => {
    const axisLength = 100;
    
    // X axis (red)
    drawAxis(ctx, cx, cy, axisLength, 0, 0, '#ef4444', 'X', rot);
    // Y axis (green)
    drawAxis(ctx, cx, cy, 0, axisLength, 0, '#22c55e', 'Y', rot);
    // Z axis (blue)
    drawAxis(ctx, cx, cy, 0, 0, axisLength, '#3b82f6', 'Z', rot);
  };

  const drawAxis = (ctx: CanvasRenderingContext2D, cx: number, cy: number, dx: number, dy: number, dz: number, color: string, label: string, rot: any) => {
    const rotatedX = dx * Math.cos(rot.y) - dz * Math.sin(rot.y);
    const rotatedZ = dx * Math.sin(rot.y) + dz * Math.cos(rot.y);
    const rotatedY = dy * Math.cos(rot.x) - rotatedZ * Math.sin(rot.x);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + rotatedX, cy - rotatedY);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.font = '12px Inter';
    ctx.fillText(label, cx + rotatedX + 5, cy - rotatedY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;

    setRotation({
      x: rotation.x + deltaY * 0.01,
      y: rotation.y + deltaX * 0.01
    });

    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className="clustering-viz-loading">
        <div className="spinner"></div>
        <p>Computing clusters...</p>
      </div>
    );
  }

  return (
    <div className="clustering-viz-3d">
      <div className="viz-header">
        <h3 className="viz-title">{title}</h3>
        <div className="viz-controls">
          <button onClick={() => setRotation({ x: 0, y: 0 })}>
            Reset View
          </button>
          <button onClick={() => setRotation({ x: rotation.x, y: rotation.y + 0.5 })}>
            Rotate
          </button>
        </div>
      </div>

      <div className="viz-canvas-container">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        />
      </div>

      <div className="viz-legend">
        <h4>Clusters:</h4>
        <div className="legend-items">
          {Array.from(new Set(data.map(p => p.cluster))).map(cluster => (
            <div key={cluster} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: clusterColors[cluster % clusterColors.length] }}
              />
              <span className="legend-label">Cluster {cluster + 1}</span>
              <span className="legend-count">
                ({data.filter(p => p.cluster === cluster).length} customers)
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="viz-info">
        💡 Drag to rotate • K-Means clustering visualization
      </p>
    </div>
  );
};

export default ClusteringViz3D;
