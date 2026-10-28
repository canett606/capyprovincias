/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AnswerForm } from "../src/components/AnswerForm";
import { Gallows } from "../src/components/Gallows";
import { CalendarQuizScreen } from "../src/screens/CalendarQuizScreen";
import { CalendarSheetScreen } from "../src/screens/CalendarSheetScreen";
import { NounScreen } from "../src/screens/NounScreen";
import { RangeQuizScreen } from "../src/screens/RangeQuizScreen";
import { RiverAtlasScreen } from "../src/screens/RiverAtlasScreen";
import { RiverQuizScreen } from "../src/screens/RiverQuizScreen";
import { planRanges } from "../shared/ranges";
import { planRivers } from "../shared/rivers";
import { nounResult, planCalendar, planNouns } from "../shared/valencia";

afterEach(() => cleanup());

describe("escribir la provincia", () => {
  it("mete la cedilla con un botón, para el teclado del iPhone", () => {
    const sent: string[] = [];
    render(<AnswerForm label="En valenciano" extraKeys={["ç"]} onSubmit={(value) => sent.push(value)} />);
    fireEvent.change(screen.getByLabelText("En valenciano"), { target: { value: "mar" } });
    fireEvent.click(screen.getByRole("button", { name: "ç" }));
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(sent).toEqual(["març"]);
  });

  it("envía el texto al pulsar comprobar", () => {
    const sent: string[] = [];
    render(<AnswerForm onSubmit={(value) => sent.push(value)} />);
    fireEvent.change(screen.getByLabelText("Provincia"), { target: { value: "  Bizkaia " } });
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(sent).toEqual(["Bizkaia"]);
  });

  it("comprueba al pulsar enter, igual que el botón", () => {
    const sent: string[] = [];
    render(<AnswerForm onSubmit={(value) => sent.push(value)} />);
    const input = screen.getByLabelText("Provincia");
    fireEvent.change(input, { target: { value: "Bizkaia" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(sent).toEqual(["Bizkaia"]);
  });
});

describe("mapa de ríos para aprender", () => {
  it("al pulsar un número enseña el nombre en un cuadro", () => {
    render(<RiverAtlasScreen onExit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Número 17" }));
    expect(screen.getByRole("status").textContent).toContain("17. Llobregat");
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

describe("escribir la cordillera", () => {
  it("corrige el nombre escrito con el teclado", () => {
    vi.spyOn(Date, "now").mockReturnValue(42);
    const [unit] = planRanges({ seed: 42, count: 8 });
    render(<RangeQuizScreen mode="practica" onExit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    fireEvent.change(screen.getByLabelText("Cordillera"), { target: { value: unit.name } });
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText(`Sí. ${unit.name}.`)).toBeTruthy();
    vi.restoreAllMocks();
  });
});

describe("gènere i nombre", () => {
  it("corrige las dos respuestas", () => {
    vi.spyOn(Date, "now").mockReturnValue(42);
    const [noun] = planNouns({ seed: 42, count: 12 });
    render(<NounScreen mode="practica" onExit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    fireEvent.click(screen.getByRole("button", { name: noun.gender === "masculi" ? /^masculí/ : /^femení/ }));
    fireEvent.click(screen.getByRole("button", { name: noun.number === "singular" ? /^singular/ : /^plural/ }));
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText(nounResult(noun, noun.gender, noun.number).line)).toBeTruthy();
    vi.restoreAllMocks();
  });
});

describe("dies i mesos", () => {
  it("corrige la palabra escrita", () => {
    vi.spyOn(Date, "now").mockReturnValue(42);
    const [item] = planCalendar({ seed: 42, count: 10 });
    render(<CalendarQuizScreen mode="preguntas" onExit={() => undefined} />);
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    fireEvent.change(screen.getByLabelText("En valenciano"), { target: { value: item.name } });
    fireEvent.click(screen.getByRole("button", { name: "Comprobar" }));
    expect(screen.getByText(`Sí. ${item.name}.`)).toBeTruthy();
    vi.restoreAllMocks();
  });

  it("tapa el valenciano de la ficha y lo vuelve a enseñar", () => {
    render(<CalendarSheetScreen onExit={() => undefined} />);
    expect(screen.getByRole("button", { name: /Dilluns/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Tapar el valenciano" }));
    expect(screen.queryByRole("button", { name: /Dilluns/ })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /lunes/ }));
    expect(screen.getByRole("button", { name: /Dilluns/ })).toBeTruthy();
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
