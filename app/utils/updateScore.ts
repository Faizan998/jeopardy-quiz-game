import { supabase } from '../lib/supabase';

const updateScore = async (userId: string, points: number) => {
  const { error } = await supabase
    .from('users')
    .update({ score: supabase.rpc('increment', { column: 'score', value: points }) })
    .eq('id', userId);

  if (error) {
    console.error('Error updating score:', error);
  }
};

export default updateScore;
