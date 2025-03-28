import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { getTruckers } from "../../services/api";

interface Trucker {
  trucker_id: number;
  name: string;
  phone_number: string;
  email: string;
  rating: number;
  status: string;
  age: number;
  gender: string;
}

const TruckersScreen = () => {
  const [truckers, setTruckers] = useState<Trucker[]>([]);

  useEffect(() => {
    loadTruckers();
  }, []);

  const loadTruckers = async () => {
    try {
      const data = await getTruckers();
      setTruckers(data);
    } catch (error) {
      console.error("Failed to load truckers:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚛 Truckers List</Text>
      <FlatList
        data={truckers}
        keyExtractor={(item) => item.trucker_id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.details}>📞 {item.phone_number}</Text>
            <Text style={styles.details}>✉️ {item.email}</Text>
            <Text style={styles.details}>⭐ Rating: {item.rating}/5</Text>
            <Text style={styles.details}>🚦 Status: {item.status}</Text>
            <Text style={styles.details}>🎂 Age: {item.age}</Text>
            <Text style={styles.details}>🚹 Gender: {item.gender}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
    color: "#333",
  },
  card: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  details: {
    fontSize: 14,
    color: "#555",
    marginTop: 3,
  },
});

export default TruckersScreen;
