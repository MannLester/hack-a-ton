export type HackathonLinkSource = {
  registrationUrl?: string;
  sourceUrl?: string;
};

function getCleanLink(value: string | undefined) {
  const cleanValue = value?.trim();

  return cleanValue || undefined;
}

export function getOfficialRegistrationUrl(source: HackathonLinkSource) {
  return getCleanLink(source.registrationUrl) ?? getCleanLink(source.sourceUrl);
}
