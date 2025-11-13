
interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton = ({ className = '', width = '100%', height = '20px' }: SkeletonProps) => (
  <div
    className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded-md ${className}`}
    style={{ width, height }}
  />

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-4 space-y-3">
    <Skeleton width="60%" height="24px" />
    <Skeleton width="100%" height="16px" />
    <Skeleton width="80%" height="16px" />
    <div className="flex gap-2 mt-4">
      <Skeleton width="100px" height="36px" />
      <Skeleton width="100px" height="36px" />
    </div>
  </div>
);

interface TableSkeletonProps {
  rows?: number;
}

export const TableSkeleton = ({ rows = 5 }: TableSkeletonProps) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton width="25%" height="40px" />
        <Skeleton width="25%" height="40px" />
        <Skeleton width="25%" height="40px" />
        <Skeleton width="25%" height="40px" />
      </div>
    ))}
  </div>
);
