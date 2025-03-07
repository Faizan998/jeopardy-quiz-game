import { supabase } from '../lib/supabase';

const fetchQuestions = async (level: number) => {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('level', level); // Assuming 'level' column exists

  if (error) {
    console.error('Error fetching questions:', error.message);
    return null;
  }

  if (!data || data.length === 0) {
    console.warn('No questions found for level:', level);
    return [];
  }

  return data;
};

export default fetchQuestions;
