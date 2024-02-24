---
"@preact-signals/utils": minor
---

Added `@preact-signals/utils/integrations/reanimated`. It provides hooks to convert signals to Reanimated shared values.

Example:

```tsx
import { useSignal } from "@preact-signals/react";
import { useAnimatedSharedValueOfAccessor } from "@preact-signals/utils/integrations/reanimated";
import { useAnimatedStyle } from "react-native-reanimated";

const maxLength = 10;
function ExampleComponent() {
  const input = useSignal("");
  const progress = useAnimatedSharedValueOfAccessor(
    () => input.value.length / maxLength,
    {
      type: "spring",
      params: {
        damping: 10,
      },
    }
  );
  return (
    <View>
      <CustomInput value={input} onChangeText={(v) => (input.value = v)} />
      <Animated.View
        style={useAnimatedStyle(() => ({
          alignSelf: "stretch",
          backgroundColor: "blue",
          height: 10,
          transform: [{ scaleX: progress.value }],
        }))}
      />
    </View>
  );
}
```
