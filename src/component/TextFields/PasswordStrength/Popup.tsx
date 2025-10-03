// components/AnchoredPopover.tsx
import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import {
  Modal,
  Pressable,
  View,
  Animated,
  Easing,
  LayoutRectangle,
  View as RNView,
  Dimensions,
} from 'react-native';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'over';
type Align = 'start' | 'center' | 'end';

type ManualPosition = { x: number; y: number }; // screen coordinates (from top-left)

type Props = {
  isOpen: boolean;
  onClose: () => void;

  // Choose ONE of the following:
  anchorRef?: React.RefObject<RNView | null>;
  manualPosition?: ManualPosition;

  placement?: Placement;      // default 'top'
  align?: Align;              // default 'end' (right / bottom aligned when vertical)
  offset?: number;            // gap between anchor and popover; default 8
  screenPadding?: number;     // keep inside screen; default 12

  // Styling
  backdropEnabled?: boolean;  // click outside to close; default true
  children: React.ReactNode;
};

export type AnchoredPopoverHandle = {
  recalc: () => void; // Imperative: re-measure anchor & reposition
};

const AnchoredPopover = forwardRef<AnchoredPopoverHandle, Props>(function AnchoredPopover(
  {
    isOpen,
    onClose,
    anchorRef,
    manualPosition,
    placement = 'top',
    align = 'end',
    offset = 8,
    screenPadding = 12,
    backdropEnabled = true,
    children,
  },
  ref
) {
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [contentSize, setContentSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const opacity = useRef(new Animated.Value(0)).current;

  const measureAnchor = () => {
    if (manualPosition) {
      setAnchor({ x: manualPosition.x, y: manualPosition.y, w: 0, h: 0 });
      return;
    }
    anchorRef?.current?.measureInWindow((x, y, w, h) => setAnchor({ x, y, w, h }));
  };

  useImperativeHandle(ref, () => ({
    recalc: () => {
      if (!isOpen) return;
      measureAnchor();
    },
  }));

  useEffect(() => {
    if (!isOpen) return;
    measureAnchor();
    Animated.timing(opacity, {
      toValue: 1,
      duration: 140,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  // Recalculate on rotation
  useEffect(() => {
    if (!isOpen) return;
    const sub = Dimensions.addEventListener('change', () => measureAnchor());
    return () => sub.remove();
  }, [isOpen]);

  if (!isOpen) return null;

  const { width: screenW, height: screenH } = Dimensions.get('window');

  // Compute target rect: if manualPosition provided, treat it like a 0x0 anchor at (x,y)
  const ax = anchor?.x ?? 0;
  const ay = anchor?.y ?? 0;
  const aw = anchor?.w ?? 0;
  const ah = anchor?.h ?? 0;

  // Compute left/top according to placement & align
  let left = ax;
  let top = ay;

  const cw = Math.max(contentSize.w, 1); // avoid NaN
  const ch = Math.max(contentSize.h, 1);

  if (placement === 'over') {
    // Center over the anchor (or over manual point)
    left = (aw ? ax + aw / 2 : ax) - cw / 2;
    top = (ah ? ay + ah / 2 : ay) - ch / 2;
  } else if (placement === 'top') {
    top = ay - ch - offset;
    // Horizontal alignment to anchor
    if (align === 'start') left = ax;
    if (align === 'center') left = ax + aw / 2 - cw / 2;
    if (align === 'end') left = ax + aw - cw;
  } else if (placement === 'bottom') {
    top = ay + ah + offset;
    if (align === 'start') left = ax;
    if (align === 'center') left = ax + aw / 2 - cw / 2;
    if (align === 'end') left = ax + aw - cw;
  } else if (placement === 'left') {
    left = ax - cw - offset;
    // Vertical alignment to anchor
    if (align === 'start') top = ay;
    if (align === 'center') top = ay + ah / 2 - ch / 2;
    if (align === 'end') top = ay + ah - ch;
  } else if (placement === 'right') {
    left = ax + aw + offset;
    if (align === 'start') top = ay;
    if (align === 'center') top = ay + ah / 2 - ch / 2;
    if (align === 'end') top = ay + ah - ch;
  }

  // Keep within screen bounds
  left = Math.min(Math.max(left, screenPadding), screenW - cw - screenPadding);
  top = Math.min(Math.max(top, screenPadding), screenH - ch - screenPadding);

  const Card = (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout as LayoutRectangle;
        setContentSize({ w: width, h: height });
      }}
      style={{
        borderRadius: 12,
        padding: 12,
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {children}
    </View>
  );

  return (
    <Modal visible transparent onRequestClose={onClose} animationType="none">
      <Pressable style={{ flex: 1 }} onPress={backdropEnabled ? onClose : undefined}>
        <Animated.View pointerEvents="box-none" style={{ flex: 1, opacity }}>
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top,
              left,
              // optional padding container if you want
            }}
          >
            {Card}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
});

export default AnchoredPopover;
