import { Component } from 'react';
import Alert from '@/components/ui/Alert.jsx';
import Button from '@/components/ui/Button.jsx';

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.error(error); }
  render() { if (!this.state.hasError) return this.props.children; return <div className="mx-auto max-w-xl py-16"><Alert>Something went wrong while rendering this page.</Alert><div className="mt-4"><Button onClick={() => window.location.reload()} variant="primary">Reload page</Button></div></div>; }
}
