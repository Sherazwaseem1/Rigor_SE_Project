import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "expo-router";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { ThemedText } from "@/components/ThemedText";
import { RootState } from "@/redux/store"; // Adjust path based on your Redux setup
import {
  getAdminById,
  getTruckerById,
  Trucker,
  Admin,
} from "../../services/api"; // Adjust path based on your API setup
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
import { StarRatingDisplay } from "react-native-star-rating-widget";

const UserProfileTest = () => {
  const { isAdmin, id } = useSelector((state: RootState) => state.user);
  const [userData, setUserData] = useState<Admin | Trucker | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = isAdmin
          ? await getAdminById(id)
          : await getTruckerById(id);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isFocused]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#088395" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load user data.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            if (isAdmin) {
              router.push("/AdminDashboard");
            } else {
              router.push("/TruckerDashboard");
            }
          }}
        >
          <View style={styles.backButtonContent}>
            <IconSymbol size={24} name="chevron.left" color="#333" />
            <ThemedText style={styles.backButtonLabel}>Back</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileCard}>
          <Text style={styles.profileTitle}>My profile</Text>
          <Image
            source={require("../../assets/images/prof.png")}
            style={styles.profileImage}
          />
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoField}>
            <View style={styles.iconContainer}>
              <IconSymbol name="phone" size={20} color="#7F9FB4" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Phone number</Text>
              <Text style={styles.value}>{userData.phone_number || "N/A"}</Text>
            </View>
          </View>

          <View style={styles.infoField}>
            <View style={styles.iconContainer}>
              <IconSymbol name="envelope" size={20} color="#7F9FB4" />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>Email address</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingTop: Math.max(screenHeight * 0.05, 40),
  },
  header: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    marginBottom: Math.max(screenHeight * 0.02, 16),
    zIndex: 2,
  },
  backButton: {
    paddingVertical: Math.max(screenHeight * 0.015, 12),
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  backButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonLabel: {
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    color: "#1E293B",
    marginLeft: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Math.max(screenHeight * 0.04, 32),
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    position: "relative",
  },
  profileCard: {
    backgroundColor: "#088395",
    borderRadius: 30,
    padding: 32,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    transform: [{ translateY: -5 }],
  },
  profileTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    letterSpacing: 1,
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileImage: {
    width: Math.min(Math.max(screenWidth * 0.35, 140), 180),
    height: Math.min(Math.max(screenWidth * 0.35, 140), 180),
    borderRadius: Math.min(Math.max(screenWidth * 0.175, 70), 90),
    backgroundColor: "#FFFFFF",
    borderWidth: 5,
    borderColor: "rgba(255, 255, 255, 0.9)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 15,
  },
  infoSection: {
    paddingHorizontal: Math.max(screenWidth * 0.04, 16),
    paddingTop: Math.max(screenHeight * 0.02, 16),
    position: "relative",
    zIndex: 1,
    gap: 16,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: Math.max(screenWidth * 0.06, 24),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
    transform: [{ translateY: -15 }],
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  infoField: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Math.max(screenHeight * 0.025, 20),
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#088395",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  textContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.03)",
  },
  label: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 6,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  value: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Math.max(screenHeight * 0.004, 4),
  },
  starContainer: {
    position: "relative",
    height: 24,
    width: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  partialStarOverlay: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    overflow: "hidden",
  },
  star: {
    fontSize: Math.min(Math.max(screenWidth * 0.05, 20), 24),
    marginRight: Math.max(screenWidth * 0.008, 4),
  },
  filledStarClip: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    overflow: "hidden",
  },
  ratingText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#071952",
  },
  ridesButton: {
    backgroundColor: "#088395",
    paddingVertical: Math.max(screenHeight * 0.018, 16),
    borderRadius: 20,
    alignItems: "center",
    marginTop: Math.max(screenHeight * 0.03, 24),
    marginHorizontal: Math.max(screenWidth * 0.015, 8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  ridesButtonText: {
    color: "#FFFFFF",
    fontSize: Math.min(Math.max(screenWidth * 0.04, 16), 18),
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EBF4F6",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EBF4F6",
  },
  errorText: {
    fontSize: 16,
    color: "#071952",
  },
});

export default UserProfileTest;
