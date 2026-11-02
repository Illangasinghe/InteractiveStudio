import { memo } from 'react';

/** The same warm room is retained across its wide shot, action and reaction cuts. */
export const StoryBedroomSet = memo(function StoryBedroomSet() {
  return <g>
    <rect width="1920" height="1080" fill="#f3ead7" />
    <rect y="708" width="1920" height="372" fill="#ddc4a0" />
    <path d="M0 706 H1920" stroke="#cdb18d" strokeWidth="14" />
    <g stroke="#cab08b" strokeWidth="3" opacity="0.48"><path d="M0 848 H1920 M0 1021 H1920 M415 708 L236 1080 M990 708 L995 1080 M1515 708 L1680 1080" /></g>
    <g fill="#e5d7bf" opacity="0.6">{Array.from({ length: 7 }, (_, row) => Array.from({ length: 17 }, (_, column) => <circle key={`${row}-${column}`} cx={57 + column * 115 + (row % 2) * 34} cy={195 + row * 68} r="3" />))}</g>
    <rect x="168" y="209" width="373" height="318" rx="22" fill="#d8c19e" />
    <rect x="181" y="223" width="347" height="289" rx="14" fill="#d8e9df" />
    <circle cx="442" cy="295" r="45" fill="#f3d17b" />
    <path d="M182 440 Q273 377 355 429 Q444 388 529 431 V513 H182Z" fill="#b4caa4" />
    <path d="M355 223 V512 M181 370 H529" stroke="#fbf6e7" strokeWidth="13" />
    <path d="M151 208 Q226 228 184 338 L164 518 H111 L130 208Z M548 208 Q485 234 527 339 L548 518 H596 L578 208Z" fill="#cea497" />
    <path d="M130 205 H579" stroke="#b48b68" strokeWidth="10" strokeLinecap="round" />
    <path d="M1399 722 V323 Q1399 262 1461 262 H1710 Q1770 262 1770 323 V722Z" fill="#e1d3b9" />
    <path d="M1423 711 V327 Q1423 286 1467 286 H1705 Q1747 286 1747 327 V711Z" fill="#bfccc0" />
    <path d="M1443 701 V336 Q1443 307 1472 307 H1700 Q1729 307 1729 336 V701Z" fill="none" stroke="#d8e0d1" strokeWidth="5" />
    <circle cx="1696" cy="541" r="12" fill="#b49a70" /><circle cx="1696" cy="541" r="5" fill="#dfc394" />
    <path d="M691 358 H1064" stroke="#ba946f" strokeWidth="15" strokeLinecap="round" />
    <g><rect x="711" y="276" width="29" height="72" rx="4" fill="#98b39e" /><rect x="747" y="259" width="32" height="89" rx="4" fill="#cfa588" /><rect x="785" y="282" width="27" height="66" rx="4" fill="#b8b3c8" /><rect x="818" y="268" width="31" height="80" rx="4" fill="#8ba8a7" /><path d="M716 294 H734 M753 279 H772 M824 285 H842" stroke="#f7eedc" strokeWidth="4" /></g>
    <g transform="translate(1007 313)"><path d="M-13 15 Q-39-33-12-45 Q2-26 0 12 Q3-37 30-33 Q40-4 11 20" fill="#96ad82" /><path d="M-28 10 H29 L20 35 H-19Z" fill="#cea17e" /></g>
    <ellipse cx="765" cy="928" rx="670" ry="85" fill="#b99e7b" opacity="0.2" />
    <path d="M173 797 V611 Q173 564 219 564 H1262 Q1308 564 1308 611 V797Z" fill="#8eafa4" />
    <path d="M196 779 V616 Q196 588 225 588 H1257 Q1284 588 1284 616 V779" fill="none" stroke="#acc6b8" strokeWidth="6" />
    <g stroke="#acc6b8" strokeWidth="6" opacity="0.7"><path d="M404 588 V779 M625 588 V779 M846 588 V779 M1067 588 V779" /></g>
    <rect x="160" y="775" width="1163" height="135" rx="44" fill="#ece0c4" />
    <rect x="174" y="785" width="1135" height="107" rx="37" fill="#faf3e0" />
    <path d="M177 820 Q740 780 1306 820 V904 H177Z" fill="#bdb4cb" />
    <path d="M188 845 Q739 806 1296 845 M190 874 Q739 838 1295 874" fill="none" stroke="#e1d6e7" strokeWidth="5" strokeDasharray="18 17" />
    <rect x="220" y="745" width="176" height="60" rx="26" fill="#fff9e9" transform="rotate(-5 308 775)" />
    <rect x="1089" y="745" width="176" height="60" rx="26" fill="#fff9e9" transform="rotate(5 1177 775)" />
    <path d="M184 888 V953 M1296 888 V953" stroke="#b18a65" strokeWidth="31" strokeLinecap="round" />
  </g>;
});

export const StoryBedForeground = memo(function StoryBedForeground() {
  return <g><path d="M161 901 H1322" stroke="#b28d68" strokeWidth="34" strokeLinecap="round" /><path d="M161 895 H1322" stroke="#c9a681" strokeWidth="11" strokeLinecap="round" /><circle cx="163" cy="899" r="22" fill="#c9a681" /><circle cx="1320" cy="899" r="22" fill="#c9a681" /></g>;
});

export const StoryClinicSet = memo(function StoryClinicSet() {
  return <g>
    <rect width="1920" height="1080" fill="#e4eee4" />
    <rect y="737" width="1920" height="343" fill="#d6ddd0" />
    <path d="M0 736 H1920" stroke="#b9cabe" strokeWidth="14" />
    <g stroke="#c4cdbf" strokeWidth="3" opacity="0.6"><path d="M0 887 H1920 M480 737 L420 1080 M1010 737 L1010 1080 M1530 737 L1593 1080" /></g>
    <rect x="150" y="213" width="370" height="399" rx="25" fill="#cfddcd" />
    <rect x="164" y="227" width="342" height="370" rx="16" fill="#f9f7e9" />
    <circle cx="335" cy="338" r="57" fill="#d4e5d4" /><path d="M335 303 V373 M300 338 H370" stroke="#88aaa0" strokeWidth="22" strokeLinecap="round" />
    <path d="M240 449 H430 M256 482 H414 M278 515 H392" stroke="#c4d3c2" strokeWidth="12" strokeLinecap="round" />
    <rect x="1453" y="277" width="315" height="468" rx="25" fill="#b6c9bd" />
    <rect x="1468" y="290" width="285" height="440" rx="17" fill="#d1ddd1" />
    <path d="M1475 439 H1748 M1475 587 H1748" stroke="#afc4b6" strokeWidth="10" />
    <g fill="#f8f5e6"><rect x="1510" y="342" width="54" height="88" rx="8" /><rect x="1614" y="330" width="74" height="100" rx="8" /><rect x="1512" y="509" width="71" height="67" rx="9" /><rect x="1625" y="507" width="63" height="69" rx="9" /></g>
    <g stroke="#91afa0" strokeWidth="10"><path d="M1537 368 V402 M1520 385 H1554 M1650 357 V403 M1629 380 H1671" /></g>
    <path d="M175 855 H650 V897 H175Z" fill="#b5c9bb" /><path d="M204 891 V965 M620 891 V965" stroke="#98b29f" strokeWidth="20" strokeLinecap="round" />
    <rect x="166" y="800" width="491" height="69" rx="28" fill="#f4f1de" />
    <rect x="190" y="780" width="137" height="40" rx="19" fill="#fffaf0" />
    <ellipse cx="1020" cy="944" rx="230" ry="30" fill="#a6b8a7" opacity="0.2" />
    <g transform="translate(1252 711)"><path d="M0 80 V-19" stroke="#aebfae" strokeWidth="13" strokeLinecap="round" /><path d="M-69 78 H68" stroke="#aebfae" strokeWidth="16" strokeLinecap="round" /><rect x="-87" y="-31" width="174" height="39" rx="15" fill="#f6f2df" /><path d="M-41-56 H4 L20-29 H-46Z" fill="#cbd9c6" /><rect x="33" y="-65" width="25" height="38" rx="6" fill="#a7c1b4" /></g>
  </g>;
});

export function RestIllustration({ x, y, scale = 1, kind = 'bed' }: { x: number; y: number; scale?: number; kind?: 'bed' | 'tooth' | 'paw' }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x="-148" y="-127" width="296" height="254" rx="37" fill="#fffbef" stroke="#c9d8c9" strokeWidth="7" />
    {kind === 'bed' ? <g><path d="M-99 46 V-35 M99 46 V-35 M-99 20 H99" stroke="#9cbaab" strokeWidth="12" fill="none" strokeLinecap="round" /><path d="M-95-19 H95 V17 H-95Z" fill="#c6bbd3" /><rect x="-91" y="-34" width="67" height="21" rx="9" fill="#e7e2cf" /><path d="M55-91 A38 38 0 1 0 87-39 A33 33 0 0 1 55-91Z" fill="#e5c57e" /><path d="M-55-86 L-50-75-38-72-49-65-53-52-59-65-72-70-60-75Z" fill="#b4c9b4" /></g> : kind === 'tooth' ? <path d="M-61-73 Q-13-98 0-71 Q21-100 61-73 Q87-53 68-8 L34 75 Q23 99 12 50 L0 21-12 50 Q-24 98-35 74 L-68-8 Q-88-53-61-73Z" fill="#edf1e8" stroke="#a8c0b1" strokeWidth="7" /> : <g fill="#b7cdb8"><ellipse cy="41" rx="63" ry="49" /><ellipse cx="-73" cy="-22" rx="24" ry="32" transform="rotate(-22 -73 -22)" /><ellipse cx="-26" cy="-67" rx="25" ry="33" /><ellipse cx="29" cy="-67" rx="25" ry="33" /><ellipse cx="76" cy="-22" rx="24" ry="32" transform="rotate(22 76 -22)" /></g>}
  </g>;
}
