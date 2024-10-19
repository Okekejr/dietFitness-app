import React, { createContext, useContext, useState } from "react";

interface UserFormData {
  name: string;
  weight: number;
  height: number;
  age: number;
  allergies: string[];
  preferences: { diet: string[]; workout: string[] };
  activityLevel: string;
}

const initialState: UserFormData = {
  name: "",
  weight: 0,
  height: 0,
  age: 0,
  allergies: [],
  preferences: { diet: [], workout: [] },
  activityLevel: "",
};

const UserContext = createContext<any>(null);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<UserFormData>(initialState);

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <UserContext.Provider value={{ formData, updateFormData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserData = () => useContext(UserContext);
