import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setUser, resetUser } from "../../redux/slices/userSlice";
import { RootState } from "../../redux/store";

const CheckingRedux = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const [name, setName] = useState("");

  const handleSetUser = () => {
    if (name.trim()) {
      dispatch(setUser({ name, email: `${name.toLowerCase()}@gmail.com` }));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redux State Test</Text>
      
      <Text style={styles.label}>Enter Your Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your name..."
        value={name}
        onChangeText={setName}
      />
      
      <Button title="Set User" onPress={handleSetUser} />
      <Button title="Reset User" onPress={() => dispatch(resetUser())} color="red" />

      <View style={styles.result}>
        <Text style={styles.userInfo}>Name: {user.name || "No Name"}</Text>
        <Text style={styles.userInfo}>Email: {user.email || "No Email"}</Text>
      </View>
    </View>
  );
};

export default CheckingRedux;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#555",
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#e9ecef",
    borderRadius: 5,
    width: "80%",
    alignItems: "center",
  },
  userInfo: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});
