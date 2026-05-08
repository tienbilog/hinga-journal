import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  onDone: () => void;
};

const STEPS = [
  { count: 5, sense: 'see', prompt: 'name 5 things you can see around you' },
  { count: 4, sense: 'touch', prompt: 'name 4 things you can feel' },
  { count: 3, sense: 'hear', prompt: 'name 3 things you can hear right now' },
  { count: 2, sense: 'smell', prompt: 'name 2 things you can smell' },
  { count: 1, sense: 'taste', prompt: 'name 1 thing you can taste' },
];

export default function GroundingExercise({ visible, onDone }: Props) {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<string[][]>(STEPS.map(s => Array(s.count).fill('')));

  function handleChange(stepIdx: number, inputIdx: number, val: string) {
    setInputs(prev => {
      const updated = prev.map(arr => [...arr]);
      updated[stepIdx][inputIdx] = val;
      return updated;
    });
  }

  function handleNext() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onDone();
  }

  const current = STEPS[step];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.card}>
          <Text style={styles.title}>5-4-3-2-1 grounding technique</Text>
          <Text style={styles.subtitle}>
            step {step + 1} of 5 — things you can {current.sense}
          </Text>
          <Text style={styles.prompt}>{current.prompt}</Text>

          <ScrollView style={{ maxHeight: 260 }}>
            {inputs[step].map((val, i) => (
              <TextInput
                key={i}
                style={styles.input}
                placeholder={`${i + 1}.`}
                placeholderTextColor="#a89b8c"
                value={val}
                onChangeText={t => handleChange(step, i, t)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.btn} onPress={handleNext}>
            <Text style={styles.btnText}>
              {step < STEPS.length - 1 ? 'next →' : 'done ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fdf6ee',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 48,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#4a3728', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#c9a87c', marginBottom: 6, fontWeight: '600' },
  prompt: { fontSize: 15, color: '#7a6255', marginBottom: 20 },
  input: {
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#4a3728',
    borderWidth: 1, borderColor: '#e8d5c4',
    marginBottom: 10,
  },
  btn: {
    marginTop: 16, backgroundColor: '#4a3728',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  btnText: { color: '#fdf6ee', fontSize: 16, fontWeight: '600' },
});