export function shouldAllowConvexClient({
  hasConvexUrl,
  hasClerkPublishableKey,
}: {
  hasConvexUrl: boolean;
  hasClerkPublishableKey: boolean;
}) {
  if (!hasConvexUrl) return true;

  return hasClerkPublishableKey;
}
