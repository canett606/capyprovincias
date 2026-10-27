/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { App } from "../src/App";
import { activePerson, choosePerson, clearActive, loadSave, remember, rememberRiver } from "../src/progress";

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = "#/";
});

describe("progreso por persona", () => {
  it("no mezcla los fallos de dos personas y hereda el guardado antiguo solo a la primera", () => {
    localStorage.setItem(
      "capyprovincias-v1",
      JSON.stringify({ sound: false, wrong: { madrid: 2 }, rivers: { ebro: 1 } }),
    );
    expect(choosePerson("Ana")?.name).toBe("Ana");
    expect(loadSave()).toMatchObject({ sound: false, wrong: { madrid: 2 }, rivers: { ebro: 1 } });
    expect(localStorage.getItem("capyprovincias-v1")).toBeNull();

    clearActive();
    expect(choosePerson("Luis")?.name).toBe("Luis");
    expect(loadSave().wrong).toEqual({});
    remember("sevilla", false);
    rememberRiver("tajo", false);

    clearActive();
    choosePerson("Ana");
    expect(loadSave().wrong).toEqual({ madrid: 2 });
    expect(loadSave().rivers).toEqual({ ebro: 1 });
    expect(loadSave().wrong.sevilla).toBeUndefined();
  });

  it("trata el mismo nombre con o sin tilde como la misma persona", () => {
    choosePerson("José");
    remember("cadiz", false);
    clearActive();
    choosePerson("Jose");
    expect(activePerson()?.name).toBe("José");
    expect(loadSave().wrong).toEqual({ cadiz: 1 });
  });

  it("pide el nombre antes de enseñar los juegos", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "¿Quién practica?" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: /CapyVerbs/ })).toBeNull();
    fireEvent.change(screen.getByLabelText("Tu nombre"), { target: { value: "Ana" } });
    fireEvent.click(screen.getByRole("button", { name: "Empezar" }));
    expect(screen.getByRole("link", { name: /CapyVerbs/ }).getAttribute("href")).toBe(
      "https://canett606.github.io/capyverbs/?usuario=Ana",
    );
    fireEvent.click(screen.getByRole("button", { name: "Cambiar de persona" }));
    expect(screen.getByRole("button", { name: /Ana/ })).toBeTruthy();
  });
});
