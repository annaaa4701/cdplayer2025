import { database } from '../config/firebase';
import { ref, push, set, get, update, onValue } from 'firebase/database';
import { MessageData } from '../types';

// 🔥 Firebase Database 경로
const MESSAGES_PATH = 'messages';
const PUBLIC_MESSAGE_PATH = 'publicMessage';

/**
 * 공개 메시지(라이너 노트) 가져오기
 */
export const getPublicMessage = async () => {
  const publicRef = ref(database, PUBLIC_MESSAGE_PATH);
  const snapshot = await get(publicRef);
  
  if (snapshot.exists()) {
    return snapshot.val();
  }
  
  // 기본값 반환
  return {
    from: "Nayeon",
    title: "To. My Dear Visitor",
    content: `안녕하세요.

바야흐로 한 해의 끝자락, 연말입니다.
연말연시에 큰 의미를 두지는 않는 편이지만, 
2025년은 잘 마무리하고 싶다는 마음이 들었습니다. 
언제나 그렇듯 삶은 흘러가겠지만, 
올해 소중한 순간들을 오래도록 기억하고 마음을 전하고 싶네요.

이 카드에 담은 키워드는 바로 이 힘, '회복탄력성'입니다.
제게 쓰러져도 다시 일어날 수 있는 힘을 기르는 한 해였어요.

막연히 '이것만 지나면 괜찮아질 거야'라며 앞으로의 행복을 기다리기보다는, 
지금 이 순간의 행복을 쟁취하고 사랑하며 나아가고 싶습니다.  

아끼는 마음이 닿길 바랍니다.`,
  };
};

/**
 * 공개 메시지 업데이트
 */
export const updatePublicMessage = async (message: { from: string; title: string; content: string }) => {
  const publicRef = ref(database, PUBLIC_MESSAGE_PATH);
  await set(publicRef, message);
};

/**
 * 모든 메시지 가져오기 (실시간 리스너)
 */
export const subscribeToMessages = (callback: (messages: MessageData[]) => void) => {
  const messagesRef = ref(database, MESSAGES_PATH);
  
  return onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messagesArray = Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        firebaseId: key, // Firebase 고유 ID 추가
      }));
      callback(messagesArray);
    } else {
      callback([]);
    }
  });
};

/**
 * 특정 수신자와 비밀번호로 메시지 찾기
 */
export const findMessage = async (receiver: string, password: string): Promise<MessageData | null> => {
  const messagesRef = ref(database, MESSAGES_PATH);
  const snapshot = await get(messagesRef);
  
  if (snapshot.exists()) {
    const messages = snapshot.val();
    const foundEntry = Object.entries(messages).find(([_, msg]: [string, any]) => 
      msg.receiver === receiver && msg.password === password
    );
    
    if (foundEntry) {
      const [firebaseId, messageData] = foundEntry;
      return { ...messageData as MessageData, firebaseId };
    }
  }
  
  return null;
};

/**
 * 새 메시지 추가
 */
export const addMessage = async (message: Omit<MessageData, 'id' | 'firebaseId'>) => {
  const messagesRef = ref(database, MESSAGES_PATH);
  const newMessageRef = push(messagesRef);
  
  const messageData = {
    ...message,
    id: newMessageRef.key, // Firebase가 생성한 고유 ID
    createdAt: Date.now(),
    isRead: false,
    hasReply: false,
  };
  
  await set(newMessageRef, messageData);
  return messageData;
};

/**
 * 메시지에 답장 추가
 */
export const addReply = async (messageId: string, replyContent: string) => {
  const messageRef = ref(database, `${MESSAGES_PATH}/${messageId}`);
  
  await update(messageRef, {
    reply: replyContent,
    repliedAt: Date.now(),
    hasReply: true,
  });
};

/**
 * 메시지 읽음 상태 업데이트
 */
export const markAsRead = async (messageId: string) => {
  const messageRef = ref(database, `${MESSAGES_PATH}/${messageId}`);
  
  await update(messageRef, {
    isRead: true,
    readAt: Date.now(),
  });
};

/**
 * 특정 doorId의 메시지 읽음 상태 확인
 */
export const checkDoorStatus = async (doorId: number): Promise<'empty' | 'unread' | 'read' | 'replied'> => {
  const messagesRef = ref(database, MESSAGES_PATH);
  const snapshot = await get(messagesRef);
  
  if (snapshot.exists()) {
    const messages = snapshot.val();
    const message = Object.values(messages).find((msg: any) => msg.doorId === doorId);
    
    if (message) {
      const msg = message as any;
      if (msg.hasReply) return 'replied';
      if (msg.isRead) return 'read';
      return 'unread';
    }
  }
  
  return 'empty';
};

/**
 * 초기 샘플 데이터 업로드 (처음 한 번만 실행)
 */
export const uploadSampleData = async () => {
  const sampleMessages = [
    {
      receiver: '게스트',
      password: '1234',
      doorId: 1,
      from: '주인장',
      themeColor: '#FF6B6B',
      content: `안녕하세요, 방문자님!
    
눈 내리는 숲속 우체국에 오신 것을 환영합니다.
이곳은 마음을 전하는 따뜻한 픽셀 공간이에요.

올 한 해, 당신의 겨울이
유난히 따뜻했기를 바랍니다.

메리 크리스마스!`
    },
    {
      receiver: '친구1',
      password: '0000',
      doorId: 7,
      from: '베프',
      content: `야! 올해도 고생 많았다.
내년에는 우리 더 자주 보자.
항상 응원할게!`
    }
  ];

  try {
    for (const msg of sampleMessages) {
      await addMessage(msg);
    }
  } catch (error) {
    throw error;
  }
};

// 개발 모드에서 브라우저 콘솔 접근 허용
if (import.meta.env.DEV) {
  (window as any).uploadSampleData = uploadSampleData;
  (window as any).getPublicMessage = getPublicMessage;
  (window as any).findMessage = findMessage;
  (window as any).addMessage = addMessage;
  (window as any).addReply = addReply;
  (window as any).markAsRead = markAsRead;
}
