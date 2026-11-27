
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProperties } from "../app/slices/propertySlice";

const useProperties = (params = {}) => {
  const dispatch = useDispatch();

  const {
    properties,
    loading,
    error
  } = useSelector((state) => state.properties);

  useEffect(() => {
    dispatch(fetchProperties(params));
  }, [dispatch]);

  return {
    properties,
    loading,
    error
  };
};

export default useProperties;
