<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One row per problem a merged ticket holds. `parser` and `hint` are counted as the desk counts them
  // (causes.ts: tenant and form). The desk's one-day moves (desk-notes.json) are a third problem: the
  // date moves by a day, it does not flip. They stay counted where they're filed and get a row too.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const LABEL: Record<string, string> = {
    parser: 'day and month swapped by the shared parser',
    hint: 'booking-v3 form hints MM/DD to day-first tenants',
    'one-day': 'date moves by one day (time zone)',
    unplaced: 'no tenant on file',
  };

  const rows = $derived.by(() => {
    const merged = uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket);
    const oneDay = merged.filter((r) => notes.oneDayMove.includes(r.id));
    const groups = [
      ...groupByCause(merged, tenantOf),
      ...groupByCause(oneDay, tenantOf).map((g) => ({ ...g, cause: 'one-day' as const })),
    ];
    return groups.sort((a, b) => b.reports.length - a.reports.length);
  });
  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const total = $derived(merged.length);
  const filedUnder = $derived(groupByCause(merged.filter((r) => notes.oneDayMove.includes(r.id)), tenantOf).map((g) => g.cause));
  const rawRows = (reports as Report[]).filter((r) => r.mergedInto === ticket).length;
  const tags = (t: Record<string, number>) =>
    Object.entries(t)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{total}</strong> reports in #{ticket} · <strong>{rows.length}</strong> problems
  {#if rawRows !== total}<span class="dup">({rawRows - total} rows in the export are the same report twice)</span>{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged them</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each rows as g (g.cause)}
      <tr>
        <td>
          <code>{g.cause}</code><br /><span class="what">{LABEL[g.cause]}</span>
          {#if g.cause === 'one-day'}<br /><span class="what">also counted under {filedUnder.join(', ')}, where the desk files them</span>{/if}
        </td>
        <td>{g.reports.length}</td>
        <td class="tags">{tags(g.taggedAs)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.cause]}<a href={tickets[g.cause]}>issue {tickets[g.cause].split('/').pop()}</a>{:else}<span class="none">none yet</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .dup, .what, .tags { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
</style>
