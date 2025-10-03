// app/(tabs)/(screens)/profile_setting/_components/UsernameRow.tsx
import IconButton from "@/src/component/Buttons/IconButton";
import { t } from "i18next";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import Toast from "react-native-toast-message";

// Minimal theme typing for what this component uses.
// If you already export Theme type from your theme module, import that instead.
type ThemeStyle = {
  colors: { white: string; primary: string; danger?: string };
  fontFamily: { semibold: string; regular: string };
  fontSize: { description: number };
};

type UsernameRowProps = {
  username?: string | null;
  themeStyle: ThemeStyle;
  onSaveUsername?: (newName: string) => Promise<void> | void;
  onEditInfo?: () => void; // optional, not required
};

const UsernameRow: React.FC<UsernameRowProps> = ({
  username,
  themeStyle,
  onSaveUsername,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string>(username ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setDraft(username ?? "");
  }, [username]);

  const handleStartEdit = () => {
    setDraft(username ?? "");
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(username ?? "");
    setEditing(false);
  };

  const handleSave = async () => {
    const v = draft.trim();
    if (!v) {
      Toast.show({ type: "error", text1: "Username is required" });
      return;
    }
    try {
      await onSaveUsername?.(v);
      setEditing(false);
      Toast.show({ type: "success", text1: "Username updated" });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "Update failed",
        text2: e?.message ?? "Please try again",
      });
    }
  };

  const underlineInputStyle = {
    fontFamily: themeStyle.fontFamily.regular,
    fontSize: themeStyle.fontSize.description,
    flex: 1 as const,
    paddingVertical: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: focused ? themeStyle.colors.primary : "#CCD1D9",
  };

  return (
    <View
      style={{
        flexDirection: "column",
        alignSelf: "center",
        width: "85%",
        backgroundColor: themeStyle.colors.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 25,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20
        }}
      >
        <View
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10 }}
        >
          <Text
            style={{
              fontFamily: themeStyle.fontFamily.semibold,
              fontSize: themeStyle.fontSize.description,
            }}
          >
            {t('Username')}:
          </Text>

          {editing ? (
            <TextInput
              value={draft}
              onChangeText={setDraft}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              style={underlineInputStyle}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter username"
            />
          ) : (
            <Text
              style={{
                fontFamily: themeStyle.fontFamily.regular,
                fontSize: themeStyle.fontSize.description,
              }}
            >
              {username || "-"}
            </Text>
          )}
        </View>

        {editing ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <IconButton
              source={require("@/assets/icons/check.png")}
              size={20}
              iconSize={20}
              tintColor={themeStyle.colors.primary}
              onPress={handleSave}
            />
            <IconButton
              source={require("@/assets/icons/cancel.png")}
              size={20}
              iconSize={20}
              tintColor={themeStyle.colors.danger || "#E74C3C"}
              onPress={handleCancel}
            />
          </View>
        ) : (
          <IconButton
            source={require("@/assets/icons/pencil.png")}
            size={20}
            iconSize={15}
            tintColor={themeStyle.colors.primary}
            onPress={handleStartEdit}
          />
        )}
      </View>
    </View>
  );
};

export default UsernameRow;
