"use client";

import { useState, useEffect, useRef } from "react";

type Theme = "light" | "dark" | "dim";

export function LiquidGlassSwitcher() {
  const [theme, setTheme] = useState<Theme>("dim");
  const switcherRef = useRef<HTMLFieldSetElement>(null);
  const previousRef = useRef<string>("2");

  // Track previous selection for animation direction
  useEffect(() => {
    const el = switcherRef.current;
    if (!el) return;

    const radios = el.querySelectorAll('input[type="radio"]');
    let previousValue: string | null = null;

    // Init first select
    const initiallyChecked = el.querySelector('input[type="radio"]:checked');
    if (initiallyChecked) {
      previousValue = initiallyChecked.getAttribute("c-option");
      el.setAttribute("c-previous", previousValue || "");
    }

    const handleChange = (e: Event) => {
      const radio = e.target as HTMLInputElement;
      if (radio.checked) {
        el.setAttribute("c-previous", previousValue ?? "");
        previousValue = radio.getAttribute("c-option");
      }
    };

    radios.forEach((radio) => {
      radio.addEventListener("change", handleChange);
    });

    return () => {
      radios.forEach((radio) => {
        radio.removeEventListener("change", handleChange);
      });
    };
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  return (
    <>
      <style jsx global>{`
        .switcher {
          --c-glass: #bbbbbc;
          --c-light: #fff;
          --c-dark: #000;
          --c-content: #e1e1e1;
          --c-action: #00bae2;
          --glass-reflex-dark: 2;
          --glass-reflex-light: 0.3;
          --saturation: 150%;

          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          width: 150px;
          max-width: 150px;
          height: 42px;
          box-sizing: border-box;
          padding: 4px;
          margin: 0;
          margin-right: 40px;
          border: none;
          border-radius: 99em;
          background-color: color-mix(in srgb, var(--c-glass) 12%, transparent);
          backdrop-filter: blur(8px) saturate(var(--saturation));
          -webkit-backdrop-filter: blur(8px) saturate(var(--saturation));
          box-shadow: inset 0 0 0 1px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 10%),
                transparent
              ),
            inset 1.8px 3px 0px -2px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 90%),
                transparent
              ),
            inset -2px -2px 0px -2px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 80%),
                transparent
              ),
            inset -3px -8px 1px -6px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 60%),
                transparent
              ),
            inset -0.3px -1px 4px 0px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 12%),
                transparent
              ),
            inset -1.5px 2.5px 0px -2px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 20%),
                transparent
              ),
            inset 0px 3px 4px -2px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 20%),
                transparent
              ),
            inset 2px -6.5px 1px -4px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 10%),
                transparent
              ),
            0px 1px 5px 0px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 10%),
                transparent
              ),
            0px 6px 16px 0px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 8%),
                transparent
              );
          transition: background-color 400ms cubic-bezier(1, 0, 0.4, 1),
            box-shadow 400ms cubic-bezier(1, 0, 0.4, 1);
        }

        .switcher__legend {
          position: absolute;
          width: 1px;
          height: 1px;
          margin: -1px;
          border: 0;
          padding: 0;
          white-space: nowrap;
          clip-path: inset(100%);
          clip: rect(0 0 0 0);
          overflow: hidden;
        }

        .switcher__input {
          clip: rect(0 0 0 0);
          clip-path: inset(100%);
          height: 1px;
          width: 1px;
          overflow: hidden;
          position: absolute;
          white-space: nowrap;
        }

        .switcher__icon {
          display: block;
          width: 20px;
          height: 20px;
          transition: scale 200ms cubic-bezier(0.5, 0, 0, 1);
        }

        .switcher__filter {
          position: absolute;
          width: 0;
          height: 0;
          z-index: -1;
        }

        .switcher__option {
          --c: var(--c-content);
          display: flex;
          justify-content: center;
          align-items: center;
          width: 48px;
          height: 100%;
          box-sizing: border-box;
          border-radius: 99em;
          opacity: 1;
          transition: all 160ms;
        }

        .switcher__option:hover {
          --c: var(--c-action);
          cursor: pointer;
        }

        .switcher__option:hover .switcher__icon {
          scale: 1.2;
        }

        .switcher__option:has(input:checked) {
          --c: var(--c-content);
          cursor: auto;
        }

        .switcher__option:has(input:checked) .switcher__icon {
          scale: 1;
        }

        .switcher::after {
          content: "";
          position: absolute;
          left: 4px;
          top: 3px;
          display: block;
          width: 48px;
          height: calc(100% - 6px);
          border-radius: 99em;
          background-color: color-mix(in srgb, var(--c-glass) 36%, transparent);
          z-index: -1;
          box-shadow: inset 0 0 0 1px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 10%),
                transparent
              ),
            inset 2px 1px 0px -1px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 90%),
                transparent
              ),
            inset -1.5px -1px 0px -1px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 80%),
                transparent
              ),
            inset -2px -6px 1px -5px
              color-mix(
                in srgb,
                var(--c-light) calc(var(--glass-reflex-light) * 60%),
                transparent
              ),
            inset -1px 2px 3px -1px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 20%),
                transparent
              ),
            inset 0px -4px 1px -2px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 10%),
                transparent
              ),
            0px 3px 6px 0px
              color-mix(
                in srgb,
                var(--c-dark) calc(var(--glass-reflex-dark) * 8%),
                transparent
              );
        }

        .switcher:has(input[c-option="1"]:checked)::after {
          translate: 0px 0;
          transform-origin: right;
          transition: background-color 400ms cubic-bezier(1, 0, 0.4, 1),
            box-shadow 400ms cubic-bezier(1, 0, 0.4, 1),
            translate 400ms cubic-bezier(1, 0, 0.4, 1);
          animation: scaleToggle 440ms ease;
        }

        .switcher:has(input[c-option="2"]:checked)::after {
          translate: 48px 0;
          transition: background-color 400ms cubic-bezier(1, 0, 0.4, 1),
            box-shadow 400ms cubic-bezier(1, 0, 0.4, 1),
            translate 400ms cubic-bezier(1, 0, 0.4, 1);
          animation: scaleToggle2 440ms ease;
        }

        .switcher[c-previous="1"]:has(input[c-option="2"]:checked)::after {
          transform-origin: left;
        }

        .switcher[c-previous="3"]:has(input[c-option="2"]:checked)::after {
          transform-origin: right;
        }

        .switcher:has(input[c-option="3"]:checked)::after {
          translate: 96px 0;
          transform-origin: left;
          transition: background-color 400ms cubic-bezier(1, 0, 0.4, 1),
            box-shadow 400ms cubic-bezier(1, 0, 0.4, 1),
            translate 400ms cubic-bezier(1, 0, 0.4, 1);
          animation: scaleToggle3 440ms ease;
        }

        @keyframes scaleToggle {
          0% {
            scale: 1 1;
          }
          50% {
            scale: 1.1 1;
          }
          100% {
            scale: 1 1;
          }
        }

        @keyframes scaleToggle2 {
          0% {
            scale: 1 1;
          }
          50% {
            scale: 1.2 1;
          }
          100% {
            scale: 1 1;
          }
        }

        @keyframes scaleToggle3 {
          0% {
            scale: 1 1;
          }
          50% {
            scale: 1.1 1;
          }
          100% {
            scale: 1 1;
          }
        }

        /* Light Theme Override */
        [data-theme="light"] .switcher {
          --c-glass: #bbbbbc;
          --c-light: #fff;
          --c-dark: #000;
          --c-content: #224466;
          --c-action: #0052f5;
          --glass-reflex-dark: 1;
          --glass-reflex-light: 1;
          --saturation: 150%;
        }

        /* Dim Theme Override */
        [data-theme="dim"] .switcher {
          --c-glass: hsl(335 250% 74% / 1);
          --c-light: #99deff;
          --c-dark: #20001b;
          --c-content: #d5dbe2;
          --c-action: #ff48a9;
          --glass-reflex-dark: 2;
          --glass-reflex-light: 0.7;
          --saturation: 200%;
        }
      `}</style>

      <fieldset className="switcher" ref={switcherRef}>
        <legend className="switcher__legend">Choose theme</legend>

        <label className="switcher__option">
          <input
            className="switcher__input"
            type="radio"
            name="theme"
            value="light"
            c-option="1"
            checked={theme === "light"}
            onChange={() => handleChange("light")}
          />
          <svg
            className="switcher__icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 36 36"
          >
            <path
              fill="var(--c)"
              fillRule="evenodd"
              d="M18 12a6 6 0 1 1 0 12 6 6 0 0 1 0-12Zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
              clipRule="evenodd"
            />
            <path
              fill="var(--c)"
              d="M17 6.038a1 1 0 1 1 2 0v3a1 1 0 0 1-2 0v-3ZM24.244 7.742a1 1 0 1 1 1.618 1.176L24.1 11.345a1 1 0 1 1-1.618-1.176l1.763-2.427ZM29.104 13.379a1 1 0 0 1 .618 1.902l-2.854.927a1 1 0 1 1-.618-1.902l2.854-.927ZM29.722 20.795a1 1 0 0 1-.619 1.902l-2.853-.927a1 1 0 1 1 .618-1.902l2.854.927ZM25.862 27.159a1 1 0 0 1-1.618 1.175l-1.763-2.427a1 1 0 1 1 1.618-1.175l1.763 2.427ZM19 30.038a1 1 0 0 1-2 0v-3a1 1 0 1 1 2 0v3ZM11.755 28.334a1 1 0 0 1-1.618-1.175l1.764-2.427a1 1 0 1 1 1.618 1.175l-1.764 2.427ZM6.896 22.697a1 1 0 1 1-.618-1.902l2.853-.927a1 1 0 1 1 .618 1.902l-2.853.927ZM6.278 15.28a1 1 0 1 1 .618-1.901l2.853.927a1 1 0 1 1-.618 1.902l-2.853-.927ZM10.137 8.918a1 1 0 0 1 1.618-1.176l1.764 2.427a1 1 0 0 1-1.618 1.176l-1.764-2.427Z"
            />
          </svg>
        </label>

        <label className="switcher__option">
          <input
            className="switcher__input"
            type="radio"
            name="theme"
            value="dark"
            c-option="2"
            checked={theme === "dark"}
            onChange={() => handleChange("dark")}
          />
          <svg
            className="switcher__icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 36 36"
          >
            <path
              fill="var(--c)"
              d="M12.5 8.473a10.968 10.968 0 0 1 8.785-.97 7.435 7.435 0 0 0-3.737 4.672l-.09.373A7.454 7.454 0 0 0 28.732 20.4a10.97 10.97 0 0 1-5.232 7.125l-.497.27c-5.014 2.566-11.175.916-14.234-3.813l-.295-.483C5.53 18.403 7.13 11.93 12.017 8.77l.483-.297Zm4.234.616a8.946 8.946 0 0 0-2.805.883l-.429.234A9 9 0 0 0 10.206 22.5l.241.395A9 9 0 0 0 22.5 25.794l.416-.255a8.94 8.94 0 0 0 2.167-1.99 9.433 9.433 0 0 1-2.782-.313c-5.043-1.352-8.036-6.535-6.686-11.578l.147-.491c.242-.745.573-1.44.972-2.078Z"
            />
          </svg>
        </label>

        <label className="switcher__option">
          <input
            className="switcher__input"
            type="radio"
            name="theme"
            value="dim"
            c-option="3"
            checked={theme === "dim"}
            onChange={() => handleChange("dim")}
          />
          <svg
            className="switcher__icon"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 36 36"
          >
            <path
              fill="var(--c)"
              d="M5 21a1 1 0 0 1 1-1h24a1 1 0 1 1 0 2H6a1 1 0 0 1-1-1ZM12 25a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H13a1 1 0 0 1-1-1ZM15 29a1 1 0 0 1 1-1h4a1 1 0 1 1 0 2h-4a1 1 0 0 1-1-1ZM18 13a6 6 0 0 1 5.915 7h-2.041A4.005 4.005 0 0 0 18 15a4 4 0 0 0-3.874 5h-2.041A6 6 0 0 1 18 13ZM17 7.038a1 1 0 1 1 2 0v3a1 1 0 0 1-2 0v-3ZM24.244 8.742a1 1 0 1 1 1.618 1.176L24.1 12.345a1 1 0 1 1-1.618-1.176l1.763-2.427ZM29.104 14.379a1 1 0 0 1 .618 1.902l-2.854.927a1 1 0 1 1-.618-1.902l2.854-.927ZM6.278 16.28a1 1 0 1 1 .618-1.901l2.853.927a1 1 0 1 1-.618 1.902l-2.853-.927ZM10.137 9.918a1 1 0 0 1 1.618-1.176l1.764 2.427a1 1 0 0 1-1.618 1.176l-1.764-2.427Z"
            />
          </svg>
        </label>

        <div className="switcher__filter">
          <svg>
            <filter id="switcher" primitiveUnits="objectBoundingBox">
              <feImage
                result="map"
                width="100%"
                height="100%"
                x="0"
                y="0"
                href="[BASE64_PLACEHOLDER_SWITCHER]"
              />
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="0.04"
                result="blur"
              />
              <feDisplacementMap
                id="disp"
                in="blur"
                in2="map"
                scale="0.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>

            <filter id="toggler" primitiveUnits="objectBoundingBox">
              <feImage
                result="map"
                width="100%"
                height="100%"
                x="0"
                y="0"
                href="[BASE64_PLACEHOLDER_TOGGLER]"
              />
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="0.01"
                result="blur"
              />
              <feDisplacementMap
                id="disp"
                in="blur"
                in2="map"
                scale="0.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </svg>
        </div>
      </fieldset>
    </>
  );
}
