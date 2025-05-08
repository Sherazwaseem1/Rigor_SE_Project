// TripAnalytics.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart, BarChart } from "react-native-gifted-charts";

import { getAllTrips } from "../../services/api";
import type { Trip } from "../../services/util";
import { useIsFocused } from "@react-navigation/native";
import styles from "../../assets/styles/styleTripAnalyticsForm";

const { width } = Dimensions.get("window");

const TripAnalytics = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  const [minTripCount, setMinTripCount] = useState("2");
  const [numRoutes, setNumRoutes] = useState("3");

  const [filteredRoutes, setFilteredRoutes] = useState<
    { route: string; count: number }[]
  >([]);
  const [tripStatusData, setTripStatusData] = useState<
    { name: string; count: number; color: string }[]
  >([]);

  const isFocused = useIsFocused();

  /* ─────────────────────────  fetch & prepare data  ───────────────────────── */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const tripsData = await getAllTrips();
        if (!Array.isArray(tripsData)) throw new Error("Invalid data");
        setTrips(tripsData);
        buildRoutes(tripsData);
        buildStatus(tripsData);
      } catch (err) {
        console.error("fetchTrips -", err);
        setTrips([]);
        setFilteredRoutes([]);
        setTripStatusData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, [isFocused]);

  const buildRoutes = (data: Trip[]) => {
    const counts: Record<string, number> = {};
    data.forEach((t) => {
      const route = `${t.start_location} → ${t.end_location}`;
      counts[route] = (counts[route] || 0) + 1;
    });

    const min = parseInt(minTripCount) || 0;
    const list = Object.entries(counts)
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .filter((r) => r.count >= min);

    setFilteredRoutes(list);
  };
  useEffect(() => buildRoutes(trips), [minTripCount]);

  const buildStatus = (data: Trip[]) => {
    const acc = { Completed: 0, Scheduled: 0 };
    data.forEach((t) => {
      if (t.status === "Completed") acc.Completed += 1;
      else if (t.status === "Scheduled") acc.Scheduled += 1;
    });
    setTripStatusData([
      { name: "Completed", count: acc.Completed, color: "#088395" },
      { name: "Scheduled", count: acc.Scheduled, color: "#37B7C3" },
    ]);
  };

  /* ─────────────────────────  helpers  ───────────────────────── */
  const monthlyAverages = () => {
    if (!trips.length) return [];
    const bucket: Record<string, { sum: number; n: number }> = {};
    trips.forEach((t) => {
      const d = new Date(t.start_time);
      const key = `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`;
      if (!bucket[key]) bucket[key] = { sum: 0, n: 0 };
      bucket[key].sum += t.distance;
      bucket[key].n += 1;
    });
    return Object.entries(bucket)
      .map(([m, { sum, n }]) => ({ label: m, value: +(sum / n).toFixed(2) }))
      .sort(
        (a, b) =>
          new Date(`1/${a.label}`).getTime() -
          new Date(`1/${b.label}`).getTime()
      );
  };

  /* ─────────────────────────  render  ───────────────────────── */
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/advancedAnalytics")}
            style={styles.backButton}
          >
            <IconSymbol name="chevron.left" size={24} color="#071952" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Trip Analytics</Text>
        </View>

        {/* body */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading trip data…</Text>
            </View>
          ) : (
            <>
              {/* Pie */}
              {/* Pie + legend */}
              <View style={styles.pieRow}>
                <PieChart
                  data={tripStatusData.map((d) => ({
                    value: d.count,
                    color: d.color,
                  }))}
                  radius={100}
                  innerRadius={40}
                  showText={false} // ⬅ hide on-slice labels
                />

                {/* Legend */}
                <View style={styles.legend}>
                  {tripStatusData.map((d, i) => (
                    <View key={i} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendSwatch,
                          { backgroundColor: d.color },
                        ]}
                      />
                      <Text style={styles.legendLabel}>{d.name}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Bar */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>
                  Avg Distance per Trip (by Month)
                </Text>
                <BarChart
                  data={monthlyAverages().map((d) => ({
                    ...d,
                    frontColor: "#37B7C3",
                  }))}
                  barWidth={26}
                  noOfSections={4}
                  yAxisThickness={0}
                  xAxisLabelTextStyle={{ color: "#071952", fontSize: 10 }}
                  spacing={12}
                  width={width - 64}
                  maxValue={Math.max(
                    ...monthlyAverages().map((d) => d.value),
                    10
                  )}
                />
              </View>

              {/* Longest routes */}
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Longest Routes</Text>
                <View style={styles.filterContainer}>
                  <Text style={styles.filterLabel}>Number of Routes:</Text>
                  <TextInput
                    style={styles.filterInput}
                    value={numRoutes}
                    onChangeText={setNumRoutes}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
                {trips.length ? (
                  trips
                    .sort((a, b) => b.distance - a.distance)
                    .slice(0, parseInt(numRoutes) || 0)
                    .map((t, i) => (
                      <View key={i} style={styles.routeCard}>
                        <View style={styles.routeInfo}>
                          <Text style={styles.routeText}>
                            {t.start_location} → {t.end_location}
                          </Text>
                          <Text style={styles.routeDistance}>
                            {t.distance} km
                          </Text>
                        </View>
                      </View>
                    ))
                ) : (
                  <Text style={styles.noDataText}>No trip data available</Text>
                )}
              </View>

              {/* Popular routes */}
              <View style={styles.routesContainer}>
                <View style={styles.routeHeader}>
                  <Text style={styles.sectionTitle}>Popular Routes</Text>
                  <View style={styles.filterContainer}>
                    <Text style={styles.filterLabel}>Min Trips:</Text>
                    <TextInput
                      style={styles.filterInput}
                      value={minTripCount}
                      onChangeText={setMinTripCount}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                </View>
                {filteredRoutes.length ? (
                  filteredRoutes.map((r, i) => (
                    <View key={i} style={styles.routeCard}>
                      <View style={styles.routeInfo}>
                        <Text style={styles.routeText}>{r.route}</Text>
                        <Text style={styles.tripCount}>
                          {r.count} {r.count === 1 ? "trip" : "trips"}
                        </Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noDataText}>
                    No routes match the filter criteria
                  </Text>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TripAnalytics;
