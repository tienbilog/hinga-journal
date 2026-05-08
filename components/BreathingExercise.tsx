import React, { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, Animated, Easing,
} from 'react-native';

type Props = {
  visible: boolean;
  durationMinutes: number; // 3 for panic, 5 for anxiety
  onDone: () => void;
};

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASES: { phase: Phase; label: string; seconds: number; instruction: string }[] = [
  { phase: 'inhale', label: 'breathe in', seconds: 4, instruction: 'slowly breathe in through your nose' },
  { phase: 'hold', label: 'hold', seconds: 4, instruction: 'gently hold your breath' },
  { phase: 'exhale', label: 'breathe out', seconds: 6, instruction: 'slowly exhale through your mouth' },
];

export default function BreathingExercise({ visible, durationMinutes, onDone }: Props) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseCount, setPhaseCount] = useState(0);
  const [totalLeft, setTotalLeft] = useState(durationMinutes * 60);
  const [running, setRunning] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (visible) {
      setPhaseIdx(0);
      setPhaseCount(0);
      setTotalLeft(durationMinutes * 60);
      setRunning(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!running) return;
    const current = PHASES[phaseIdx];

    // animate circle
    animRef.current = Animated.timing(scale, {
      toValue: phaseIdx === 0 ? 1.4 : phaseIdx === 1 ? 1.4 : 1,
      duration: current.seconds * 1000,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    });
    animRef.current.start();

    const timer = setTimeout(() => {
      const next = (phaseIdx + 1) % PHASES.length;
      setPhaseIdx(next);
      setPhaseCount(c => c + 1);
    }, current.seconds * 1000);

    return () => clearTimeout(timer);
  }, [phaseIdx, running]);

  // total countdown
  useEffect(() => {
    if (!running) return;
    if (totalLeft <= 0) { handleStop(); return; }
    const t = setInterval(() => setTotalLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running]);

  function handleStop() {
    setRunning(false);
    animRef.current?.stop();
    onDone();
  }

  const current = PHASES[phaseIdx];
  const mins = Math.floor(totalLeft / 60);
  const secs = String(totalLeft % 60).padStart(2, '0');

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>breathing exercise 🌬️</Text>
          <Text style={styles.timer}>{mins}:{secs} remaining</Text>

          <View style={styles.circleWrap}>
            <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />
            <Text style={styles.phaseLabel}>{current.label}</Text>
          </View>

          <Text style={styles.instruction}>{current.instruction}</Text>

          <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
            <Text style={styles.stopBtnText}>stop</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    backgroundColor: '#fdf6ee',
    borderRadius: 28, padding: 32,
    alignItems: 'center', width: '85%',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#4a3728', marginBottom: 4 },
  timer: { fontSize: 14, color: '#a89b8c', marginBottom: 32 },
  circleWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  circle: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: '#e8d5c4',
  },
  phaseLabel: {
    position: 'absolute',
    fontSize: 16, fontWeight: '700', color: '#4a3728',
  },
  instruction: {
    fontSize: 15, color: '#7a6255',
    textAlign: 'center', marginBottom: 28, lineHeight: 22,
  },
  stopBtn: {
    borderWidth: 1.5, borderColor: '#c9a87c',
    borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32,
  },
  stopBtnText: { color: '#c9a87c', fontWeight: '600', fontSize: 15 },
});