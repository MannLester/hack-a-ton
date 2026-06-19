const htmlEntityReplacements = new Map([
  ["&amp;", "&"],
  ["&lt;", "<"],
  ["&gt;", ">"],
  ["&quot;", "\""],
  ["&#39;", "'"],
  ["&nbsp;", " "],
]);

export function getTrimmedText(value: unknown) {
  return typeof value === "string" ? value.trim() : undefined;
}

export function getPlainTextFromHtml(value: string) {
  const withoutTags = value.replace(/<[^>]*>/g, "");
  const decodedText = Array.from(htmlEntityReplacements.entries()).reduce(
    (text, [entity, replacement]) => text.replaceAll(entity, replacement),
    withoutTags,
  );

  return decodedText.replace(/\s+/g, " ").trim();
}

export function getAbsoluteHttpsUrl(value: unknown) {
  const text = getTrimmedText(value);

  if (!text) return undefined;
  if (text.startsWith("//")) return `https:${text}`;
  if (text.startsWith("https://")) return text;
  if (text.startsWith("http://")) return text;

  return undefined;
}

export function getNonEmptyArray(values: string[] | undefined) {
  return values?.map((value) => value.trim()).filter(Boolean) ?? [];
}
