import PhoneApp from './PhoneApp';

/** Non-interactive device used in the transformation scene; same component as the live app. */
export default function PhonePreview() {
  return (
    <div className="device device--preview" aria-hidden="true">
      <div className="device__body">
        <PhoneApp framed wide preview />
      </div>
    </div>
  );
}
