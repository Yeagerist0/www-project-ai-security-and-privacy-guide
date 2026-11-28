function formatExternalByPage(title, rows, pagesByUrl, informational = false) {
  if (!rows.length) return '';

  const byPage = new Map();
  for (const { url, status } of rows) {
    for (const page of pagesByUrl.get(url) || []) {
      if (!byPage.has(page)) byPage.set(page, []);
      byPage.get(page).push({ url, status });
    }
  }

  const label = informational ? ' — informational; does not fail the check' : '';
  const lines = [`\n${title} (${rows.length} unique URLs${label}):`];
  for (const page of [...byPage.keys()].sort()) {
    lines.push(`  ${page}`);
    for (const { url, status } of byPage.get(page).sort((a, b) => a.url.localeCompare(b.url))) {
      lines.push(`    ${status}: ${url}`);
    }
  }
  return lines.join('\n') + '\n';
}

function summarizeExternalResults(results, pagesByUrl) {
  const brokenUrls = new Set(results.broken.map(row => row.url));
  const unverified = results.unverified.filter(row => !brokenUrls.has(row.url));
  return {
    brokenSummary: formatExternalByPage('Broken external links', results.broken, pagesByUrl),
    unverifiedSummary: formatExternalByPage('Could not verify (site blocks automated checks, or timed out)', unverified, pagesByUrl, true),
    informationalCount: new Set(unverified.map(row => row.url)).size,
    failed: results.broken.length > 0
  };
}

function formatInformationalDetails(summary, count) {
  if (!summary) return '';
  return `<details><summary>External links the checker could not verify (${count} unique URLs; informational)</summary>\n\n`
    + '```text\n' + summary + '```\n\n</details>\n';
}

module.exports = { formatExternalByPage, summarizeExternalResults, formatInformationalDetails };
