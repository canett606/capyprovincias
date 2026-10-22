/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AnswerForm } from "../src/components/AnswerForm";
import { Gallows } from "../src/components/Gallows";

afterEach(() => cleanup());

describe("escribir la provincia", () => {
  it("envía el texto al pulsar comprobar", () => {
    const sent: string[] = [];
    render(<AnswerForm onSubmit={(value) => sent.push(value)} />);
    fireEvent.change(screen.getByLabelText("Provincia"), { target: { value: "  Bizkaia " } });
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(sent).toEqual(["Bizkaia"]);
  });
});

describe("dibujo del ahorcado", () => {
  it("empieza en blanco y añade un trazo", () => {
    const view = render(<Gallows misses={0} />);
    expect(screen.getByRole("img", { name: "Ahorcado, 0 de 6 trazos" })).toBeTruthy();
    expect(document.querySelectorAll(".gallows path")).toHaveLength(0);
    view.rerender(<Gallows misses={1} />);
    expect(document.querySelectorAll(".gallows path")).toHaveLength(1);
    view.rerender(<Gallows misses={6} />);
    expect(screen.getByRole("img", { name: "Ahorcado, 6 de 6 trazos" })).toBeTruthy();
  });
});
