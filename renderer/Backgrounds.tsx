import { memo } from 'react';

function Flower({ x, y, scale = 1, color = '#faf3db' }: { x: number; y: number; scale?: number; color?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`}><path d="M0 0 Q-5 22 0 39" stroke="#6e9362" strokeWidth="4" fill="none" /><ellipse cx="9" cy="24" rx="11" ry="4" fill="#6e9362" transform="rotate(-30 9 24)" />{[0, 72, 144, 216, 288].map(angle => <ellipse key={angle} cy="-9" rx="6" ry="10" fill={color} transform={`rotate(${angle})`} />)}<circle r="5" fill="#e8b65e" /></g>;
}

export const MeadowBackdrop = memo(function MeadowBackdrop() {
  return <>
    <rect width="1920" height="1080" fill="url(#studio-sky)" />
    <circle cx="1530" cy="228" r="112" fill="#f7dc8c" opacity="0.8" />
    <g fill="#fffdf1" opacity="0.65"><path d="M245 239 Q242 206 277 208 Q299 162 340 191 Q388 184 391 223 Q433 227 416 248 H261Z" /><path d="M1067 178 Q1068 148 1096 151 Q1117 115 1148 138 Q1184 129 1195 162 Q1229 165 1214 184 H1082Z" /></g>
    <path d="M0 554 Q245 293 598 509 Q852 285 1162 471 Q1551 237 1920 493 V1080 H0Z" fill="#c0d3b3" />
    <path d="M0 628 Q314 462 654 593 Q991 410 1355 591 Q1622 454 1920 559 V1080 H0Z" fill="#a7c4a0" />
    <path d="M0 740 Q452 548 887 679 Q1397 543 1920 713 V1080 H0Z" fill="url(#studio-ground)" />
    <path d="M0 886 Q484 767 941 858 Q1473 755 1920 865 V1080 H0Z" fill="#c0d195" />
    <path d="M0 968 Q471 914 996 963 Q1498 889 1920 964 V1080 H0Z" fill="#b8ca88" opacity="0.5" />
    <g fill="#7c9d72" opacity="0.8"><path d="M90 714 Q87 649 119 630 Q133 668 119 706 Q151 676 167 685 Q151 718 110 728Z" /><path d="M1802 700 Q1794 630 1825 612 Q1843 657 1827 695 Q1864 659 1883 673 Q1864 710 1818 714Z" /></g>
    <g fill="#f6eed7" opacity="0.7"><ellipse cx="245" cy="810" rx="37" ry="13" /><ellipse cx="1649" cy="829" rx="47" ry="17" /></g>
  </>;
});

export const MeadowForeground = memo(function MeadowForeground() {
  return <>
    <Flower x={161} y={882} scale={1.3} /><Flower x={216} y={915} scale={0.85} color="#e8b4a3" /><Flower x={1735} y={913} scale={1.1} /><Flower x={1644} y={886} scale={0.75} color="#e8b4a3" />
    <g stroke="#83a066" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.65"><path d="M385 917 l-8-18 M385 917 l7-20 M1467 894 l-7-17 M1467 894 l10-22 M590 859 l-4-14 M590 859 l8-12" /></g>
  </>;
});

export const BedroomBackdrop = memo(function BedroomBackdrop() {
  return <>
    <rect width="1920" height="1080" fill="#f4ecdb" />
    <path d="M0 700 H1920 V1080 H0Z" fill="#dfc7a5" />
    <path d="M0 700 H1920" stroke="#ceb68f" strokeWidth="15" />
    <g stroke="#cfb48e" strokeWidth="3" opacity="0.5"><path d="M0 825 H1920 M0 998 H1920 M420 700 L280 1080 M1405 700 L1580 1080 M925 700 L908 1080" /></g>
    <g fill="#e8dcc5" opacity="0.65">{Array.from({ length: 8 }, (_, row) => Array.from({ length: 17 }, (_, column) => <circle key={`${row}-${column}`} cx={70 + column * 115 + (row % 2) * 40} cy={230 + row * 60} r="3" />))}</g>
    <rect x="208" y="224" width="414" height="342" rx="28" fill="#ddc8a7" />
    <rect x="224" y="240" width="382" height="309" rx="18" fill="#dbece4" />
    <circle cx="511" cy="317" r="48" fill="#f4da86" />
    <path d="M225 475 Q318 397 408 458 Q516 407 606 458 V550 H225Z" fill="#bbd1ad" />
    <path d="M415 240 V550 M224 394 H606" stroke="#fcf7e9" strokeWidth="15" />
    <path d="M190 220 Q269 241 230 355 L203 553 H148 L169 220Z" fill="#d2a89c" />
    <path d="M619 220 Q566 249 609 358 L631 553 H682 L659 220Z" fill="#d2a89c" />
    <path d="M167 217 H664" stroke="#b58d6b" strokeWidth="12" strokeLinecap="round" />
    <path d="M1315 388 H1634" stroke="#bb9471" strokeWidth="16" strokeLinecap="round" />
    <g><rect x="1340" y="299" width="29" height="79" rx="4" fill="#a5bda5" /><rect x="1376" y="282" width="31" height="96" rx="4" fill="#d7ad8c" /><rect x="1413" y="310" width="26" height="68" rx="4" fill="#c0bdd0" /><rect x="1445" y="296" width="31" height="82" rx="4" fill="#8eaeb0" /><path d="M1346 318 H1363 M1383 303 H1400 M1452 316 H1470" stroke="#f4ead7" strokeWidth="4" /></g>
    <g transform="translate(1578 343)"><path d="M-19 7 Q-31-46-3-55 Q0-12 0 7 Q0-42 25-41 Q33-17 13 11" fill="#91aa80" /><path d="M-27 0 H28 L20 37 H-19Z" fill="#d4a486" /></g>
    <ellipse cx="960" cy="928" rx="850" ry="110" fill="#c8b18f" opacity="0.28" />
    <path d="M196 796 V592 Q196 547 241 547 H1679 Q1724 547 1724 592 V796Z" fill="#91b4aa" />
    <path d="M221 759 V593 Q221 571 246 571 H1674 Q1699 571 1699 593 V759" fill="none" stroke="#a9c6ba" strokeWidth="7" />
    <g stroke="#a8c4b8" strokeWidth="7" opacity="0.75"><path d="M469 571 V758 M715 571 V758 M960 571 V758 M1205 571 V758 M1451 571 V758" /></g>
    <rect x="190" y="773" width="1540" height="129" rx="50" fill="#efe3c6" />
    <rect x="202" y="789" width="1516" height="103" rx="42" fill="#f7f0dc" />
    <path d="M211 828 Q969 774 1708 828 V905 H211Z" fill="#c5bdd1" />
    <path d="M224 856 Q960 808 1697 856" fill="none" stroke="#e3dbea" strokeWidth="6" strokeDasharray="19 18" />
    <rect x="252" y="735" width="204" height="70" rx="30" fill="#fff9e9" transform="rotate(-5 354 770)" />
    <rect x="1462" y="735" width="204" height="70" rx="30" fill="#fff9e9" transform="rotate(5 1564 770)" />
    <path d="M222 877 V955 M1698 877 V955" stroke="#b58d6a" strokeWidth="35" strokeLinecap="round" />
  </>;
});

export const BedroomForeground = memo(function BedroomForeground() {
  return <>
    <path d="M187 896 H1733" stroke="#b38d6c" strokeWidth="36" strokeLinecap="round" />
    <path d="M190 894 H1730" stroke="#c8a583" strokeWidth="12" strokeLinecap="round" />
    <circle cx="190" cy="894" r="24" fill="#c8a583" /><circle cx="1730" cy="894" r="24" fill="#c8a583" />
  </>;
});

export const GardenBackdrop = memo(function GardenBackdrop() {
  return <>
    <rect width="1920" height="1080" fill="url(#studio-sky)" />
    <circle cx="1510" cy="236" r="105" fill="#f5d98a" />
    <path d="M0 594 Q393 416 820 556 Q1395 403 1920 563 V1080 H0Z" fill="#b7cba1" />
    <path d="M0 704 Q563 603 1020 686 Q1554 573 1920 681 V1080 H0Z" fill="#c6d6a0" />
    <path d="M0 887 Q527 798 1070 872 Q1545 795 1920 882 V1080 H0Z" fill="#b6cc91" />
    <g stroke="#e9dec0" strokeWidth="16" fill="none"><path d="M0 561 H1920 M0 666 H1920" /></g>
    <g fill="#f1e6ca">{Array.from({ length: 22 }, (_, index) => <path key={index} d={`M${index * 93 - 13} 715 V527 l23-24 23 24 V715Z`} />)}</g>
    <g transform="translate(100 473)"><path d="M-10 183 Q0 20 19-85" stroke="#a17e5d" strokeWidth="39" fill="none" /><path d="M8 55 L-55-27 M13 19 L65-55" stroke="#a17e5d" strokeWidth="19" strokeLinecap="round" /><circle cx="-50" cy="-73" r="105" fill="#a5bf99" /><circle cx="50" cy="-110" r="117" fill="#a5bf99" /><circle cy="-177" r="106" fill="#b4cba2" /></g>
    <g transform="translate(1810 611)"><path d="M-62 73 Q-108-25-57-47 Q-6-69 7-9 Q32-66 73-44 Q128-13 77 71Z" fill="#91b087" /></g>
    <ellipse cx="960" cy="926" rx="810" ry="102" fill="#789663" opacity="0.18" />
    <path d="M287 825 V952 Q287 980 314 980 H390 M1633 825 V952 Q1633 980 1606 980 H1530" stroke="#8b9d9a" strokeWidth="23" fill="none" strokeLinecap="round" />
    <path d="M566 880 V969 M1354 880 V969" stroke="#8b9d9a" strokeWidth="22" strokeLinecap="round" />
    <path d="M219 804 V378 Q219 347 251 347 H1669 Q1701 347 1701 378 V804" fill="#f4fbef" fillOpacity="0.09" stroke="#91a6a1" strokeWidth="11" />
    <g stroke="#93b0a1" strokeWidth="2" opacity="0.26">{Array.from({ length: 28 }, (_, index) => <path key={index} d={`M${246 + index * 53} 354 V788`} />)}{Array.from({ length: 9 }, (_, index) => <path key={index} d={`M225 ${381 + index * 49} H1695`} />)}</g>
    <ellipse cx="960" cy="824" rx="758" ry="102" fill="#6f9295" />
    <ellipse cx="960" cy="799" rx="758" ry="102" fill="#a9c6bf" />
    <ellipse cx="960" cy="792" rx="685" ry="81" fill="#7a9698" />
    <ellipse cx="960" cy="789" rx="674" ry="75" fill="#849fa0" />
    <path d="M503 790 H1417" stroke="#aac4bf" strokeWidth="3" opacity="0.55" />
  </>;
});

export const GardenForeground = memo(function GardenForeground() {
  return <>
    <path d="M207 823 Q960 1039 1713 823" fill="none" stroke="#87aaa6" strokeWidth="24" />
    <path d="M219 804 V587 M1701 804 V587" stroke="#91a6a1" strokeWidth="11" strokeLinecap="round" />
    <Flower x={115} y={906} scale={1.2} /><Flower x={1797} y={901} scale={1.2} color="#e8b4a3" />
  </>;
});

