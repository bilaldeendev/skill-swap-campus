import React from "react";

// The signature element of Skill Swap Campus: two interlocking arrows,
// representing the two-way exchange at the heart of the product.
export default function SwapMark({ size = 28, spin = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={spin ? "swapmark-spin" : ""}
    >
      <path
        d="M9 14H27L22 9"
        stroke="#FF9F1C"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 26H13L18 31"
        stroke="#0F8B8D"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
