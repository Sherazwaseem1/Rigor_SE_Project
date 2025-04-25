import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker } from "react-native-maps";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { getAllLocations, getLocationById } from "../../services/api";

const Maps: React.FC = () => {
  const user = useSelector((state: RootState) => state.user);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (user.isAdmin === false) {
          const location = await getLocationById(user.id);
          setLocations([location]);
        } else if (user.isAdmin === true) {
          const allLocations = await getAllLocations();
          setLocations(allLocations);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MapView style={styles.map}>
        {locations.map((location) => (
        <Marker
          key={location.location_id}
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={`Trip ID: ${location.trip_id}`}
          description={`Timestamp: ${new Date(location.timestamp).toLocaleString()}`}
        />
      ))}
      </MapView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Maps;