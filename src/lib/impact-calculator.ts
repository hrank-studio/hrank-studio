export type WorkloadAssumptions = {
  reviewManual: number;
  reviewAssisted: number;
  postManual: number;
  postAssisted: number;
};

export function calculateWorkload(
  reviews: number,
  posts: number,
  assumptions: WorkloadAssumptions,
) {
  const manualMinutes = reviews * assumptions.reviewManual + posts * assumptions.postManual;
  const assistedMinutes = reviews * assumptions.reviewAssisted + posts * assumptions.postAssisted;
  const savedMinutes = manualMinutes - assistedMinutes;

  return {
    manualMinutes,
    assistedMinutes,
    savedMinutes,
    changePercent: manualMinutes > 0 ? (savedMinutes / manualMinutes) * 100 : null,
    taskCount: reviews + posts,
  };
}

export function calculateRadarProfile(
  reviews: number,
  posts: number,
  assumptions: WorkloadAssumptions,
  capacity: { reviews: number; posts: number },
): { before: Record<string, number>; after: Record<string, number> } {
  const result = calculateWorkload(reviews, posts, assumptions);
  const percent = (value: number, maximum: number) => maximum > 0
    ? Math.min(100, Math.max(0, value / maximum * 100))
    : 0;
  const before: Record<string, number> = {
    reviews: percent(reviews, capacity.reviews),
    content: percent(posts, capacity.posts),
    control: result.taskCount > 0 ? 100 : 0,
    workflow: percent(result.taskCount, capacity.reviews + capacity.posts),
    time: 0,
  };

  return {
    before,
    after: { ...before, time: percent(result.savedMinutes, result.manualMinutes) },
  };
}
