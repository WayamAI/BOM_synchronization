import { createContext, useContext, useState } from "react";
import type { VehicleProgram } from "@/lib/mockData";
import { programs } from "@/lib/mockData";

interface ProgramContextValue {
  activeProgram: VehicleProgram;
  setActiveProgramId: (id: string) => void;
}

const ProgramContext = createContext<ProgramContextValue | null>(null);

export const ProgramProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeProgramId, setActiveProgramId] = useState("meridian-suv");
  const activeProgram = programs.find(p => p.id === activeProgramId) ?? programs[0];

  return (
    <ProgramContext.Provider value={{ activeProgram, setActiveProgramId }}>
      {children}
    </ProgramContext.Provider>
  );
};

export const useProgramContext = () => {
  const ctx = useContext(ProgramContext);
  if (!ctx) throw new Error("useProgramContext must be inside ProgramProvider");
  return ctx;
};
