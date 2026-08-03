import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BASE_FEE,
  LARGE_BASE_FEE,
  LARGE_RATE_PER_KM_DAY,
  LARGE_RATE_PER_KM_NIGHT,
  NIGHT_END_HOUR,
  NIGHT_START_HOUR,
  RATE_PER_KM_DAY,
  RATE_PER_KM_NIGHT,
  WAITING_FEE_PER_HOUR,
  formatEuro,
} from "@/lib/fare";
import type { Locale } from "@/i18n-config";

export type TariffTableDictionary = {
  positionHeader: string;
  priceHeader: string;
  baseFee: string;
  baseFeeLarge: string;
  perKmDay: string;
  perKmNight: string;
  waitingFee: string;
  tariff1: string;
  tariff2: string;
  perHour: string;
};

/**
 * The official tariff, rendered straight from the constants in `src/lib/fare.ts`.
 * No numbers are hardcoded here, so the next tariff change stays a one-file edit
 * and the table can never drift away from what the calculator charges.
 */
export function TariffTable({ dict, lang }: { dict: TariffTableDictionary; lang: Locale }) {
  const dayWindow = `${NIGHT_END_HOUR}-${NIGHT_START_HOUR}`;
  const nightWindow = `${NIGHT_START_HOUR}-${NIGHT_END_HOUR}`;

  const rows: { label: string; note?: string; value: string; group?: string }[] = [
    {
      group: dict.tariff1,
      label: dict.baseFee,
      value: formatEuro(BASE_FEE, lang),
    },
    {
      label: dict.perKmDay,
      note: `(${dayWindow})`,
      value: formatEuro(RATE_PER_KM_DAY, lang),
    },
    {
      label: dict.perKmNight,
      note: `(${nightWindow})`,
      value: formatEuro(RATE_PER_KM_NIGHT, lang),
    },
    {
      group: dict.tariff2,
      label: dict.baseFeeLarge,
      value: formatEuro(LARGE_BASE_FEE, lang),
    },
    {
      label: dict.perKmDay,
      note: `(${dayWindow})`,
      value: formatEuro(LARGE_RATE_PER_KM_DAY, lang),
    },
    {
      label: dict.perKmNight,
      note: `(${nightWindow})`,
      value: formatEuro(LARGE_RATE_PER_KM_NIGHT, lang),
    },
    {
      label: dict.waitingFee,
      note: dict.perHour,
      value: formatEuro(WAITING_FEE_PER_HOUR, lang),
    },
  ];

  return (
    <div className="glass-card rounded-2xl border border-white/10 p-2 md:p-4">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-transparent">
            <TableHead className="text-muted-foreground">{dict.positionHeader}</TableHead>
            <TableHead className="text-right text-muted-foreground">{dict.priceHeader}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={`${row.label}-${index}`} className="border-white/10 hover:bg-white/5">
              <TableCell className="py-3">
                {row.group && (
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    {row.group}
                  </div>
                )}
                <span className="text-foreground">{row.label}</span>
                {row.note && (
                  <span className="ml-2 text-xs text-muted-foreground">{row.note}</span>
                )}
              </TableCell>
              <TableCell className="py-3 text-right font-semibold text-foreground whitespace-nowrap">
                {row.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
