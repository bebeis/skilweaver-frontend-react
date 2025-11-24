import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// MSW 서버 인스턴스 생성
export const server = setupServer(...handlers);

