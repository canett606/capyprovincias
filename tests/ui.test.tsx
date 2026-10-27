/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnswerForm } from "../src/components/AnswerForm";
import { Gallows } from "../src/components/Gallows";
import { RiverQuizScreen } from "../src/screens/RiverQuizScreen";
import { planRivers } from "../shared/rivers";

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

describe("escribir el río", () => {
  it("corrige el nombre escrito con el teclado", () => {
    vi.spyOn(Date, "now").mockReturnValue(42);
    const [river] = planRivers({ seed: 42, count: 10 });
    render(<RiverQuizScreen mode="practica" onExit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    fireEvent.change(screen.getByLabelText("Río"), { target: { value: river.name } });
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText(`Sí. ${river.name}.`)).toBeTruthy();
    vi.restoreAllMocks();
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
