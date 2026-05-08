import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { saveCheckIn } from '../storage/checkins';
import { Category } from '../storage/categories';
import GroundingExercise from './GroundingExercise';
import BreathingExercise from './BreathingExercise';

type Props = {
  visible: boolean;
  categories: Category[];
  onDone: (categoryChosen?: string) => void;
};

type SupportType = 'panic' | 'anxiety' | null;
type SupportStep = 'ask' | 'grounding' | 'breathing' | null;

function detectSupport(emotions: string[]): SupportType {
  const joined = emotions.join(' ').toLowerCase();
  const panicWords = ['panic', 'panicking', 'panicked', 'panicky'];
  const anxietyWords = ['anxious', 'anxiety', 'anxiousness', 'anxiously', 'worried', 'worrying', 'overwhelmed'];
  if (panicWords.some(w => joined.includes(w))) return 'panic';
  if (anxietyWords.some(w => joined.includes(w))) return 'anxiety';
  return null;
}

export default function CheckInModal({ visible, categories, onDone }: Props) {
  const [emotions, setEmotions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [step, setStep] = useState<'emotions' | 'category'>('emotions');

  const [supportType, setSupportType] = useState<SupportType>(null);
  const [supportStep, setSupportStep] = useState<SupportStep>(null);
  const [showGrounding, setShowGrounding] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  function addEmotion() {
    const trimmed = input.trim();
    if (!trimmed || emotions.length >= 5) return;
    setEmotions(prev => [...prev, trimmed]);
    setInput('');
  }

  function removeEmotion(index: number) {
    setEmotions(prev => prev.filter((_, i) => i !== index));
  }

  async function handleNext() {
    if (emotions.length === 0) return;

    const detected = detectSupport(emotions);
    if (detected) {
      setSupportType(detected);
      setSupportStep('ask');
      return;
    }

    setStep('category');
  }

  async function handleDone() {
    await saveCheckIn({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      emotions,
      categoryChosen: selectedCategory ?? undefined,
    });
    reset();
    onDone(selectedCategory ?? undefined);
  }

  function reset() {
    setEmotions([]);
    setInput('');
    setSelectedCategory(null);
    setStep('emotions');
    setSupportType(null);
    setSupportStep(null);
  }

  function handleSupportYes() {
    setSupportStep(null);
    if (supportType === 'panic') setShowGrounding(true);
    else setShowBreathing(true);
  }

  function handleSupportNo() {
    setSupportStep(null);
    setStep('category');
  }

  function handleGroundingDone() {
    setShowGrounding(false);
    setShowBreathing(true);
  }

  function handleBreathingDone() {
    setShowBreathing(false);
    setStep('category');
  }

  return (
    <>
      {/* Grounding exercise */}
      <GroundingExercise
        visible={showGrounding}
        onDone={handleGroundingDone}
      />

      {/* Breathing exercise */}
      <BreathingExercise
        visible={showBreathing}
        durationMinutes={supportType === 'panic' ? 3 : 5}
        onDone={handleBreathingDone}
      />

      {/* Support prompt */}
      <Modal visible={supportStep === 'ask'} animationType="fade" transparent>
        <View style={styles.overlay}>
          <View style={styles.supportCard}>
            <Text style={styles.supportEmoji}>
              {supportType === 'panic' ? '💙' : '🌿'}
            </Text>
            <Text style={styles.supportTitle}>
              {supportType === 'panic'
                ? "it sounds like you're panicking"
                : "it sounds like you're feeling anxious"}
            </Text>
            <Text style={styles.supportSub}>
              {supportType === 'panic'
                ? "would you like to try a grounding technique?"
                : "would you like to try a breathing exercise?"}
            </Text>
            <TouchableOpacity style={styles.yesBtn} onPress={handleSupportYes}>
              <Text style={styles.yesBtnText}>yes, let's try it</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.noBtn} onPress={handleSupportNo}>
              <Text style={styles.noBtnText}>no, continue to journal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main check-in modal */}
      <Modal visible={visible && supportStep === null && !showGrounding && !showBreathing} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlayBottom}
        >
          <View style={styles.card}>
            {step === 'emotions' ? (
              <>
                <Text style={styles.title}>what are you feeling?</Text>
                <Text style={styles.subtitle}>add up to 5 emotions</Text>

                <View style={styles.tagRow}>
                  {emotions.map((e, i) => (
                    <TouchableOpacity key={i} style={styles.tag} onPress={() => removeEmotion(i)}>
                      <Text style={styles.tagText}>{e} ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. happy, tired, grateful..."
                    placeholderTextColor="#a89b8c"
                    value={input}
                    onChangeText={setInput}
                    onSubmitEditing={addEmotion}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addBtn} onPress={addEmotion}>
                    <Text style={styles.addBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.doneBtn, emotions.length === 0 && styles.disabled]}
                  onPress={handleNext}
                  disabled={emotions.length === 0}
                >
                  <Text style={styles.doneBtnText}>next →</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.title}>want to start a new entry?</Text>
                <Text style={styles.subtitle}>pick a category or skip</Text>

                <FlatList
                  data={categories}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.categoryOption,
                        selectedCategory === item.id && styles.categorySelected,
                      ]}
                      onPress={() => setSelectedCategory(prev => prev === item.id ? null : item.id)}
                    >
                      <Text style={styles.categoryText}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                  style={{ maxHeight: 220 }}
                />

                <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
                  <Text style={styles.doneBtnText}>
                    {selectedCategory ? 'open entry →' : 'skip for now'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
  },
  overlayBottom: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fdf6ee',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 28, paddingBottom: 48,
  },
  supportCard: {
    backgroundColor: '#fdf6ee',
    borderRadius: 24, padding: 28,
    alignItems: 'center', width: '85%',
  },
  supportEmoji: { fontSize: 40, marginBottom: 12 },
  supportTitle: {
    fontSize: 18, fontWeight: '700', color: '#4a3728',
    textAlign: 'center', marginBottom: 8,
  },
  supportSub: {
    fontSize: 14, color: '#7a6255',
    textAlign: 'center', marginBottom: 24, lineHeight: 20,
  },
  yesBtn: {
    backgroundColor: '#4a3728', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 32,
    alignItems: 'center', width: '100%', marginBottom: 10,
  },
  yesBtnText: { color: '#fdf6ee', fontSize: 15, fontWeight: '600' },
  noBtn: {
    paddingVertical: 12, alignItems: 'center', width: '100%',
  },
  noBtnText: { color: '#a89b8c', fontSize: 14 },
  title: { fontSize: 22, fontWeight: '700', color: '#4a3728', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#a89b8c', marginBottom: 20 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: '#e8d5c4', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  tagText: { color: '#4a3728', fontSize: 13 },
  inputRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: '#4a3728',
    borderWidth: 1, borderColor: '#e8d5c4',
  },
  addBtn: {
    backgroundColor: '#c9a87c', borderRadius: 12,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '600' },
  doneBtn: {
    backgroundColor: '#4a3728', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  doneBtnText: { color: '#fdf6ee', fontSize: 16, fontWeight: '600' },
  categoryOption: {
    padding: 14, borderRadius: 12, backgroundColor: '#fff',
    marginBottom: 8, borderWidth: 1, borderColor: '#e8d5c4',
  },
  categorySelected: { backgroundColor: '#e8d5c4', borderColor: '#c9a87c' },
  categoryText: { color: '#4a3728', fontSize: 15 },
});