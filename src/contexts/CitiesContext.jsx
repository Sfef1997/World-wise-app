import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useMemo,
  useCallback,
} from "react";

const Base_Url = "http://localhost:9000";
const citiesContext = createContext();
const intialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};
function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity: {},
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    default:
      throw new Error("unKnown Action Type");
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    intialState
  );
  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`${Base_Url}/cities`);
        const data = await res.json();
        dispatch({ type: "cities/loaded", payload: data });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There Was an Error With Loading Data",
        });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(async function getCity(id) {
    console.log(currentCity.id, id);
    if (Number(id) === currentCity.id) return;
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${Base_Url}/cities/${id}`);
      const data = await res.json();
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There Was an Error With Loading Data",
      });
    }
  });
  async function createCity(newCity) {
    dispatch({ type: "loading" });
    try {
      const res = await fetch(`${Base_Url}/cities`, {
        method: "POST",
        body: JSON.stringify(newCity),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      dispatch({ type: "city/created", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There Was an Error With Creating City",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });
    try {
      await fetch(`${Base_Url}/cities/${id}`, {
        method: "DELETE",
      });

      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There Was an Error With Deleting City",
      });
    }
  }

  const value = useMemo(() => {
    return {
      cities,
      isLoading,
      currentCity,
      getCity,
      createCity,
      deleteCity,
      error,
    };
  }, [cities, isLoading, currentCity, error, getCity]);
  return (
    <citiesContext.Provider value={value}>{children}</citiesContext.Provider>
  );
}
function useCities() {
  const context = useContext(citiesContext);
  if (context === undefined)
    throw new Error("Cities context used OutSide the cities Provider");
  return context;
}

export { useCities, CitiesProvider };
